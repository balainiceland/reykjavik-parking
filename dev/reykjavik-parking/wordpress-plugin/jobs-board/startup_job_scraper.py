#!/usr/bin/env python3
"""
Startup Job Scraper for Iceland
Scrapes job postings from alfred.is and tvinna.is
Matches against the Startup Iceland directory

Features:
- Scrapes tvinna.is (HTTP) and alfred.is (Playwright for JS rendering)
- Matches companies against the Startup Directory
- Deduplicates against existing jobs in jobs-data.js
- Merges new jobs into jobs-data.js automatically

Usage:
    python3 startup_job_scraper.py              # Scrape and save to scraped_jobs.json
    python3 startup_job_scraper.py --merge      # Scrape and merge into jobs-data.js
    python3 startup_job_scraper.py --playwright # Use Playwright for alfred.is (requires: pip install playwright && playwright install chromium)
"""

import argparse
import json
import re
import time
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional, Set, Tuple
from urllib.parse import urljoin
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Optional Playwright import
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

HEADERS = {
    "User-Agent": "StartupIcelandJobsBot/1.0 (+https://startupiceland.com/jobs/)"
}

# ---------------- Startup Directory ----------------

def load_startup_names(js_file_path: str) -> Set[str]:
    """Extract startup names from the startups-data.js file."""
    startups = set()

    with open(js_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract names using regex - looking for name: "..." patterns
    pattern = r'name:\s*"([^"]+)"'
    matches = re.findall(pattern, content)

    for name in matches:
        # Add original name
        startups.add(name.lower().strip())
        # Add variations without common suffixes
        for suffix in [' ehf', ' ehf.', ' hf', ' hf.', ' slf', ' ses', ' inc', ' ltd']:
            if name.lower().endswith(suffix):
                startups.add(name.lower().replace(suffix, '').strip())

    return startups


def normalize_company_name(name: str) -> str:
    """Normalize company name for matching."""
    name = name.lower().strip()
    # Remove common suffixes
    for suffix in [' ehf', ' ehf.', ' hf', ' hf.', ' slf', ' ses', ' inc', ' ltd', ' iceland']:
        name = name.replace(suffix, '')
    return name.strip()


def is_startup(company_name: str, startup_names: Set[str]) -> bool:
    """Check if a company name matches any startup in the directory."""
    normalized = normalize_company_name(company_name)

    # Direct match
    if normalized in startup_names:
        return True

    # Check if any startup name is contained in the company name
    for startup in startup_names:
        if startup in normalized or normalized in startup:
            return True

    return False


# ---------------- Jobs Data File Operations ----------------

def load_existing_jobs(js_file_path: str) -> Tuple[List[Dict], int]:
    """
    Load existing jobs from jobs-data.js file.
    Returns (list of jobs, max_id)
    """
    with open(js_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the jobs array using regex
    # Looking for: jobs: [ ... ]
    jobs_match = re.search(r'jobs:\s*\[(.*?)\n\s*\]\s*\n\};', content, re.DOTALL)
    if not jobs_match:
        print("Warning: Could not find jobs array in jobs-data.js")
        return [], 0

    jobs_content = jobs_match.group(1)

    # Parse individual job objects
    jobs = []
    max_id = 0

    # Find all job objects
    job_pattern = re.compile(r'\{\s*id:\s*(\d+),.*?\n\s*\}', re.DOTALL)

    for match in job_pattern.finditer(jobs_content):
        job_str = match.group(0)
        job_id = int(match.group(1))
        max_id = max(max_id, job_id)

        # Extract fields using regex
        job = {'id': job_id}

        # Extract string fields
        for field in ['company', 'title', 'description', 'category', 'type',
                      'experienceLevel', 'location', 'remote', 'salary',
                      'postedDate', 'applicationUrl']:
            field_match = re.search(rf'{field}:\s*"([^"]*)"', job_str)
            if field_match:
                job[field] = field_match.group(1)
            else:
                # Check for null
                null_match = re.search(rf'{field}:\s*null', job_str)
                if null_match:
                    job[field] = None

        # Extract boolean fields
        featured_match = re.search(r'featured:\s*(true|false)', job_str)
        if featured_match:
            job['featured'] = featured_match.group(1) == 'true'

        jobs.append(job)

    return jobs, max_id


def create_job_key(job: Dict) -> str:
    """Create a unique key for a job for deduplication."""
    company = normalize_company_name(job.get('company', ''))
    title = job.get('title', '').lower().strip()
    # Remove common variations
    title = re.sub(r'\s+', ' ', title)
    title = re.sub(r'[^\w\s]', '', title)
    return f"{company}::{title}"


def create_url_key(job: Dict) -> str:
    """Create a URL-based key for deduplication."""
    url = job.get('applicationUrl', '') or job.get('url', '')
    # Normalize URL
    url = url.lower().strip().rstrip('/')
    return url


def deduplicate_jobs(new_jobs: List[Dict], existing_jobs: List[Dict]) -> List[Dict]:
    """
    Remove jobs that already exist in the existing jobs list.
    Uses both company+title and URL for matching.
    """
    existing_keys = set()
    existing_urls = set()

    for job in existing_jobs:
        existing_keys.add(create_job_key(job))
        url_key = create_url_key(job)
        if url_key:
            existing_urls.add(url_key)

    unique_jobs = []
    for job in new_jobs:
        job_key = create_job_key(job)
        url_key = create_url_key(job)

        # Check for duplicates
        if job_key in existing_keys:
            print(f"  Skipping duplicate (title match): {job.get('company')} - {job.get('title')}")
            continue

        if url_key and url_key in existing_urls:
            print(f"  Skipping duplicate (URL match): {job.get('company')} - {job.get('title')}")
            continue

        unique_jobs.append(job)
        # Add to sets to prevent duplicates within new jobs too
        existing_keys.add(job_key)
        if url_key:
            existing_urls.add(url_key)

    return unique_jobs


def merge_jobs_into_datafile(new_jobs: List[Dict], js_file_path: str) -> int:
    """
    Merge new jobs into the jobs-data.js file.
    Returns the number of jobs added.
    """
    with open(js_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Load existing jobs
    existing_jobs, max_id = load_existing_jobs(js_file_path)
    print(f"Loaded {len(existing_jobs)} existing jobs (max ID: {max_id})")

    # Deduplicate
    print("Deduplicating jobs...")
    unique_new_jobs = deduplicate_jobs(new_jobs, existing_jobs)
    print(f"Found {len(unique_new_jobs)} new unique jobs to add")

    if not unique_new_jobs:
        print("No new jobs to add.")
        return 0

    # Generate JavaScript for new jobs
    new_jobs_js = []
    for i, job in enumerate(unique_new_jobs):
        job_id = max_id + i + 1
        job_js = generate_job_js(job, job_id)
        new_jobs_js.append(job_js)

    # Find the position to insert (before the closing ] of jobs array)
    # Look for the last job entry and add after it
    insert_pattern = re.compile(r'(\n\s*\}\s*)\n(\s*\]\s*\n\};)', re.DOTALL)
    match = insert_pattern.search(content)

    if match:
        # Insert new jobs after the last job
        # Jobs need to be separated by commas
        new_content = (
            content[:match.start(1)] +
            match.group(1) + ',\n' +
            ',\n'.join(new_jobs_js) +
            '\n' + match.group(2)[1:]  # Skip the leading newline
        )

        # Update metadata
        new_total = len(existing_jobs) + len(unique_new_jobs)
        new_content = re.sub(
            r'totalJobs:\s*\d+',
            f'totalJobs: {new_total}',
            new_content
        )
        new_content = re.sub(
            r'lastUpdated:\s*"[^"]+"',
            f'lastUpdated: "{datetime.now().strftime("%Y-%m-%d")}"',
            new_content
        )

        # Write back
        with open(js_file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"Added {len(unique_new_jobs)} new jobs. Total: {new_total}")
        return len(unique_new_jobs)

    else:
        print("Error: Could not find insertion point in jobs-data.js")
        return 0


def generate_job_js(job: Dict, job_id: int) -> str:
    """Generate JavaScript object string for a job."""
    def escape_js_string(s):
        if s is None:
            return 'null'
        s = str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
        return f'"{s}"'

    company = escape_js_string(job.get('company', ''))
    title = escape_js_string(job.get('title', ''))
    description = escape_js_string(job.get('description', ''))
    category = escape_js_string(job.get('category', 'other'))
    job_type = escape_js_string(job.get('type', 'full-time'))
    exp_level = escape_js_string(job.get('experienceLevel', 'mid'))
    location = escape_js_string(job.get('location', 'Iceland'))
    remote = escape_js_string(job.get('remote', 'onsite'))
    salary = 'null'
    posted_date = escape_js_string(job.get('postedDate', datetime.now().strftime('%Y-%m-%d')))
    app_url = escape_js_string(job.get('applicationUrl', job.get('url', '')))
    featured = 'false'

    return f"""        {{
            id: {job_id},
            company: {company},
            companyLogo: null,
            title: {title},
            description: {description},
            category: {category},
            type: {job_type},
            experienceLevel: {exp_level},
            location: {location},
            remote: {remote},
            salary: {salary},
            postedDate: {posted_date},
            applicationUrl: {app_url},
            featured: {featured}
        }}"""


# ---------------- Job Schema ----------------

@dataclass
class Job:
    company: str
    title: str
    description: str
    category: str
    job_type: str
    experience_level: str
    location: str
    remote: str
    url: str
    source: str  # 'tvinna' or 'alfred'
    posted_date: str = ""

    def to_dict(self) -> Dict:
        return {
            "company": self.company,
            "companyLogo": None,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "type": self.job_type,
            "experienceLevel": self.experience_level,
            "location": self.location,
            "remote": self.remote,
            "salary": None,
            "postedDate": self.posted_date or datetime.now().strftime("%Y-%m-%d"),
            "applicationUrl": self.url,
            "featured": False,
            "source": self.source
        }


# ---------------- Category/Type Inference ----------------

CATEGORY_RULES = [
    (re.compile(r"\b(engineer|developer|backend|frontend|full[- ]?stack|devops|sre|software|forritari|hugbúnaðar|programmer)\b", re.I), "engineering"),
    (re.compile(r"\b(data|scientist|analytics|ml|machine learning|ai|artificial)\b", re.I), "engineering"),
    (re.compile(r"\b(design|ux|ui|grafísk|hönnuður|hönnun|visual)\b", re.I), "design"),
    (re.compile(r"\b(marketing|markaðs|growth|content|seo|community|samfélagsmiðla)\b", re.I), "marketing"),
    (re.compile(r"\b(sales|sölu|account executive|ae|sdr|bdr|revenue)\b", re.I), "sales"),
    (re.compile(r"\b(operations|ops|people|hr|talent|recruit|starfsmannamál|ráðning)\b", re.I), "operations"),
    (re.compile(r"\b(product manager|pm|vörustjór|product)\b", re.I), "product"),
    (re.compile(r"\b(finance|accountant|controller|cfo|fjármál|bókhald)\b", re.I), "finance"),
    (re.compile(r"\b(quality|qa|gæða|test)\b", re.I), "operations"),
    (re.compile(r"\b(cto|ceo|chief|framkvæmdastjór)\b", re.I), "operations"),
]

TYPE_RULES = [
    (re.compile(r"\b(intern|internship|starfsnám|nám)\b", re.I), "internship"),
    (re.compile(r"\b(contract|freelance|verktaki)\b", re.I), "contract"),
    (re.compile(r"\b(part[- ]?time|hlutastarf)\b", re.I), "part-time"),
]

EXPERIENCE_RULES = [
    (re.compile(r"\b(chief|vp|head of|director|cxo|cto|ceo|framkvæmdastjór)\b", re.I), "executive"),
    (re.compile(r"\b(lead|principal|staff|leiðtogi|yfir)\b", re.I), "lead"),
    (re.compile(r"\b(senior|sr\.|reyndur)\b", re.I), "senior"),
    (re.compile(r"\b(mid|intermediate)\b", re.I), "mid"),
    (re.compile(r"\b(junior|jr\.|entry|graduate|nýútskrifaður)\b", re.I), "entry"),
]

REMOTE_RULES = [
    (re.compile(r"\b(remote|fjarvinnu|heimavinn)\b", re.I), "remote"),
    (re.compile(r"\b(hybrid|blönduð)\b", re.I), "hybrid"),
]


def guess_category(text: str) -> str:
    for rx, cat in CATEGORY_RULES:
        if rx.search(text):
            return cat
    return "other"


def guess_type(text: str) -> str:
    for rx, t in TYPE_RULES:
        if rx.search(text):
            return t
    return "full-time"


def guess_experience(text: str) -> str:
    for rx, lvl in EXPERIENCE_RULES:
        if rx.search(text):
            return lvl
    return "mid"


def guess_remote(text: str) -> str:
    for rx, opt in REMOTE_RULES:
        if rx.search(text):
            return opt
    return "onsite"


def clean_text(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


# ---------------- Tvinna.is Scraper ----------------

class TvinnaScraper:
    BASE_URL = "https://www.tvinna.is"
    JOBS_URL = "https://www.tvinna.is/jobs/"

    def __init__(self, timeout: int = 20, delay: float = 1.0):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.timeout = timeout
        self.delay = delay

    def fetch(self, url: str) -> Optional[str]:
        try:
            r = self.session.get(url, timeout=self.timeout)
            if r.status_code >= 400:
                return None
            return r.text
        except requests.RequestException as e:
            print(f"  Error fetching {url}: {e}")
            return None

    def scrape_job_list(self, max_pages: int = 10) -> List[Dict]:
        """Scrape the job listing pages."""
        jobs = []
        seen_urls = set()

        url = self.JOBS_URL
        page = 1

        while url and page <= max_pages:
            print(f"  Scraping tvinna.is page {page}...")
            html = self.fetch(url)
            time.sleep(self.delay)

            if not html:
                break

            soup = BeautifulSoup(html, "lxml")

            # Find job listings - they're in article or div elements with job links
            job_links = soup.select('a[href*="/jobs/"]')

            for link in job_links:
                href = link.get('href', '')
                if not href or href == '/jobs/' or href in seen_urls:
                    continue

                # Skip navigation links
                if 'page' in href.lower():
                    continue

                full_url = urljoin(self.BASE_URL, href)
                if full_url in seen_urls:
                    continue
                seen_urls.add(full_url)

                # Extract basic info from the listing
                title = clean_text(link.get_text())
                if len(title) < 3:
                    continue

                # Find company name - usually in nearby elements
                parent = link.find_parent(['article', 'div', 'li'])
                company = ""
                job_type = "full-time"

                if parent:
                    text = parent.get_text(" ", strip=True)
                    # Try to find company name patterns
                    company_match = re.search(r'[|·–-]\s*([^|·–\n]+?)(?:\s*[|·–]|$)', text)
                    if company_match:
                        company = clean_text(company_match.group(1))

                    # Check for job type
                    if re.search(r'\b(hlutastarf|part[- ]?time)\b', text, re.I):
                        job_type = "part-time"
                    elif re.search(r'\b(freelance|verktaki)\b', text, re.I):
                        job_type = "contract"

                jobs.append({
                    'url': full_url,
                    'title': title,
                    'company': company,
                    'type': job_type
                })

            # Find next page link
            next_link = None
            for a in soup.select('a[href*="page"]'):
                text = a.get_text(strip=True).lower()
                if 'next' in text or '»' in text or 'næsta' in text:
                    next_link = a
                    break

            if next_link:
                url = urljoin(self.BASE_URL, next_link.get('href', ''))
                page += 1
            else:
                break

        return jobs

    def scrape_job_detail(self, url: str) -> Optional[Dict]:
        """Scrape details from a single job page."""
        html = self.fetch(url)
        if not html:
            return None

        soup = BeautifulSoup(html, "lxml")

        # Extract job title - usually in h1 or h2
        title = ""
        for selector in ['h1', 'h2', '.job-title', '[class*="title"]']:
            el = soup.select_one(selector)
            if el:
                title = clean_text(el.get_text())
                if len(title) > 3:
                    break

        # Find company name - look for external links that are likely company websites
        company = ""

        # First, look for links to company websites (not tvinna.is internal links)
        for a in soup.select('a[href]'):
            href = a.get('href', '')
            text = clean_text(a.get_text())

            # Skip internal links and short text
            if 'tvinna.is' in href or len(text) < 2:
                continue

            # Skip common non-company links
            if any(x in href.lower() for x in ['linkedin', 'facebook', 'twitter', 'instagram', 'mailto:']):
                continue

            # If the link looks like a company website
            if re.match(r'^https?://', href) and len(text) < 50:
                # Check if it's a known startup
                if is_startup(text, self._startup_names) if hasattr(self, '_startup_names') else True:
                    company = text
                    break
                # Or if it appears before job content
                if not company:
                    company = text

        # Find description - look for main content area
        description = ""
        desc_el = soup.select_one('article, .content, main, .description')
        if desc_el:
            for tag in desc_el.find_all(['script', 'style', 'nav', 'footer', 'header']):
                tag.decompose()
            description = clean_text(desc_el.get_text(" ", strip=True))
            if len(description) > 400:
                description = description[:400].rsplit(' ', 1)[0] + "..."

        # Get full text for category/type inference
        full_text = soup.get_text(" ", strip=True)

        # Check for job type
        job_type = "full-time"
        if re.search(r'\b(hlutastarf|part[- ]?time)\b', full_text, re.I):
            job_type = "part-time"
        elif re.search(r'\b(freelance|verktaki|contract)\b', full_text, re.I):
            job_type = "contract"

        return {
            'title': title,
            'company': company,
            'description': description,
            'type': job_type,
            'full_text': full_text
        }

    def scrape_all_jobs(self, startup_names: Set[str], follow_details: bool = True) -> List[Job]:
        """Scrape all jobs and filter by startup names."""
        print("Scraping tvinna.is...")
        self._startup_names = startup_names  # Store for use in detail scraping

        job_list = self.scrape_job_list()
        print(f"  Found {len(job_list)} total job listings")

        startup_jobs = []
        seen_urls = set()

        for job_info in job_list:
            url = job_info['url']
            if url in seen_urls:
                continue

            # Always fetch details to get accurate company name
            time.sleep(self.delay)
            details = self.scrape_job_detail(url)

            if not details:
                continue

            company = details.get('company', '').strip()
            title = details.get('title', job_info.get('title', ''))

            # Skip jobs with no company name
            if not company or company.startswith('http'):
                continue

            # Normalize company name - remove "ehf." suffix for matching
            company_for_match = company

            # Check if it's a startup
            if not is_startup(company_for_match, startup_names):
                continue

            seen_urls.add(url)
            print(f"  Found startup job: {company} - {title}")

            description = details.get('description', '')
            full_text = details.get('full_text', f"{title} {company}")
            job_type = details.get('type') or job_info.get('type') or guess_type(full_text)

            job = Job(
                company=company,
                title=title,
                description=description,
                category=guess_category(full_text),
                job_type=job_type,
                experience_level=guess_experience(full_text),
                location="Iceland",
                remote=guess_remote(full_text),
                url=url,
                source="tvinna"
            )
            startup_jobs.append(job)

        print(f"  Found {len(startup_jobs)} startup jobs on tvinna.is")
        return startup_jobs


# ---------------- Alfred.is Scraper ----------------

class AlfredScraper:
    BASE_URL = "https://alfred.is"
    JOBS_URL = "https://alfred.is/storf"

    def __init__(self, timeout: int = 20, delay: float = 1.0):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.timeout = timeout
        self.delay = delay

    def fetch(self, url: str) -> Optional[str]:
        try:
            r = self.session.get(url, timeout=self.timeout)
            if r.status_code >= 400:
                return None
            return r.text
        except requests.RequestException as e:
            print(f"  Error fetching {url}: {e}")
            return None

    def scrape_company_jobs(self, company_slug: str) -> List[Dict]:
        """Scrape jobs from a specific company page."""
        url = f"{self.BASE_URL}/en/fyrirtaeki/{company_slug}"
        html = self.fetch(url)

        if not html:
            # Try Icelandic version
            url = f"{self.BASE_URL}/fyrirtaeki/{company_slug}"
            html = self.fetch(url)

        if not html:
            return []

        soup = BeautifulSoup(html, "lxml")
        jobs = []

        # Find job links on company page
        for link in soup.select('a[href*="/starf/"], a[href*="/en/starf/"]'):
            href = link.get('href', '')
            title = clean_text(link.get_text())

            if len(title) < 3:
                continue

            full_url = urljoin(self.BASE_URL, href)
            jobs.append({
                'url': full_url,
                'title': title
            })

        return jobs

    def search_jobs(self, query: str = "", max_pages: int = 5) -> List[Dict]:
        """Search for jobs on alfred.is."""
        jobs = []
        seen_urls = set()

        # Alfred.is might use JavaScript rendering, so we'll try the basic HTML approach
        url = f"{self.BASE_URL}/storf"
        if query:
            url = f"{self.BASE_URL}/en/storf?q={query}"

        html = self.fetch(url)
        if not html:
            return jobs

        soup = BeautifulSoup(html, "lxml")

        # Find job cards/links
        for link in soup.select('a[href*="/starf/"]'):
            href = link.get('href', '')
            if not href or href in seen_urls:
                continue

            full_url = urljoin(self.BASE_URL, href)
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            title = clean_text(link.get_text())
            if len(title) < 3:
                continue

            # Try to find company name in nearby elements
            company = ""
            parent = link.find_parent(['article', 'div', 'li', 'section'])
            if parent:
                # Look for company name patterns
                company_el = parent.select_one('[class*="company"], [class*="employer"]')
                if company_el:
                    company = clean_text(company_el.get_text())

            jobs.append({
                'url': full_url,
                'title': title,
                'company': company
            })

        return jobs

    def scrape_job_detail(self, url: str) -> Optional[Dict]:
        """Scrape details from a single job page."""
        html = self.fetch(url)
        if not html:
            return None

        soup = BeautifulSoup(html, "lxml")

        # Extract job details
        title = ""
        company = ""
        description = ""
        location = "Iceland"
        job_type = "full-time"

        # Title
        title_el = soup.select_one('h1')
        if title_el:
            title = clean_text(title_el.get_text())

        # Company - often in h2 or specific class
        company_el = soup.select_one('h2, [class*="company"], [class*="employer"]')
        if company_el:
            company = clean_text(company_el.get_text())

        # Description
        desc_el = soup.select_one('article, .description, .content, main')
        if desc_el:
            for tag in desc_el.find_all(['script', 'style', 'nav', 'footer', 'header']):
                tag.decompose()
            description = clean_text(desc_el.get_text(" ", strip=True))
            if len(description) > 400:
                description = description[:400].rsplit(' ', 1)[0] + "..."

        # Check for job type indicators
        full_text = soup.get_text(" ", strip=True).lower()
        if 'hlutastarf' in full_text or 'part-time' in full_text:
            job_type = "part-time"
        elif 'verktaki' in full_text or 'contract' in full_text:
            job_type = "contract"

        # Location
        if 'reykjavík' in full_text or 'reykjavik' in full_text:
            location = "Reykjavik, Iceland"
        elif 'akureyri' in full_text:
            location = "Akureyri, Iceland"
        elif 'ísafjörður' in full_text or 'isafjordur' in full_text:
            location = "Ísafjörður, Iceland"

        return {
            'title': title,
            'company': company,
            'description': description,
            'location': location,
            'type': job_type,
            'full_text': full_text
        }

    def scrape_startup_jobs(self, startup_names: Set[str], startup_slugs: Dict[str, str] = None) -> List[Job]:
        """
        Scrape jobs from startups on alfred.is.

        NOTE: alfred.is uses heavy JavaScript rendering, so the main job listing
        page may not work well. Consider providing specific job URLs to scrape.
        """
        print("Scraping alfred.is...")
        print("  NOTE: alfred.is uses JavaScript rendering - results may be limited")

        startup_jobs = []
        seen_urls = set()

        # First, try to search for jobs
        job_list = self.search_jobs()
        print(f"  Found {len(job_list)} jobs from search")

        for job_info in job_list:
            company = job_info.get('company', '')

            if not is_startup(company, startup_names):
                continue

            if job_info['url'] in seen_urls:
                continue
            seen_urls.add(job_info['url'])

            print(f"  Found startup job: {company} - {job_info['title']}")

            time.sleep(self.delay)
            details = self.scrape_job_detail(job_info['url'])

            if details:
                title = details.get('title') or job_info['title']
                company = details.get('company') or company
                description = details.get('description', '')
                full_text = details.get('full_text', '')

                job = Job(
                    company=company,
                    title=title,
                    description=description,
                    category=guess_category(full_text or title),
                    job_type=details.get('type') or guess_type(full_text or title),
                    experience_level=guess_experience(full_text or title),
                    location=details.get('location', 'Iceland'),
                    remote=guess_remote(full_text or title),
                    url=job_info['url'],
                    source="alfred"
                )
                startup_jobs.append(job)

        print(f"  Found {len(startup_jobs)} startup jobs on alfred.is")
        return startup_jobs


# ---------------- Playwright-based Alfred.is Scraper ----------------

class AlfredPlaywrightScraper:
    """
    Playwright-based scraper for alfred.is that handles JavaScript rendering.
    Requires: pip install playwright && playwright install chromium
    """
    BASE_URL = "https://alfred.is"

    def __init__(self, headless: bool = True, delay: float = 1.0):
        if not PLAYWRIGHT_AVAILABLE:
            raise RuntimeError(
                "Playwright not installed. Run: pip install playwright && playwright install chromium"
            )
        self.headless = headless
        self.delay = delay
        self._startup_names = set()

    def scrape_all_jobs(self, startup_names: Set[str], max_pages: int = 10) -> List[Job]:
        """Scrape all jobs from alfred.is using Playwright."""
        self._startup_names = startup_names
        jobs = []
        seen_urls = set()

        print("Scraping alfred.is with Playwright...")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            )
            page = context.new_page()

            try:
                # Go to main page (jobs are listed on the homepage)
                print("  Loading alfred.is...")
                page.goto(self.BASE_URL, wait_until="networkidle", timeout=30000)
                time.sleep(3)  # Wait for JS to render

                # Scroll to load more jobs (infinite scroll)
                last_count = 0
                for scroll_num in range(max_pages):
                    # Get all job links on current page
                    job_links = page.query_selector_all('a[href*="/starf/"]')

                    for link in job_links:
                        href = link.get_attribute('href')
                        if not href or href in seen_urls:
                            continue

                        # Skip non-job links
                        if '/starf/' not in href:
                            continue

                        full_url = href if href.startswith('http') else f"{self.BASE_URL}{href}"
                        seen_urls.add(full_url)

                    current_count = len(seen_urls)
                    print(f"  Scroll {scroll_num + 1}: Found {current_count} job URLs")

                    # Stop if no new jobs found after scrolling
                    if current_count == last_count:
                        break
                    last_count = current_count

                    # Scroll down to load more
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(self.delay)

                print(f"  Total: {len(seen_urls)} job URLs found")

                # Now fetch details for each job
                for url in seen_urls:
                    try:
                        job = self._scrape_job_detail(page, url)
                        if job and is_startup(job.company, startup_names):
                            print(f"  Found startup job: {job.company} - {job.title}")
                            jobs.append(job)
                        time.sleep(self.delay * 0.5)
                    except Exception as e:
                        print(f"  Error scraping {url}: {e}")
                        continue

            finally:
                browser.close()

        print(f"  Found {len(jobs)} startup jobs on alfred.is")
        return jobs

    def _scrape_job_detail(self, page, url: str) -> Optional[Job]:
        """Scrape a single job detail page."""
        try:
            page.goto(url, wait_until="networkidle", timeout=20000)
            time.sleep(0.5)

            # Extract title
            title_el = page.query_selector('h1')
            title = title_el.inner_text().strip() if title_el else ""

            # Extract company - look for links to external sites
            company = ""
            company_links = page.query_selector_all('a[href^="http"]')
            for link in company_links:
                href = link.get_attribute('href') or ''
                text = link.inner_text().strip()

                # Skip social media and internal links
                if any(x in href.lower() for x in ['alfred.is', 'linkedin', 'facebook', 'twitter', 'instagram']):
                    continue

                if len(text) > 2 and len(text) < 50:
                    company = text
                    break

            if not company:
                return None

            # Extract description
            description = ""
            content_el = page.query_selector('article, main, .content')
            if content_el:
                description = content_el.inner_text()[:400].strip()
                if len(description) == 400:
                    description = description.rsplit(' ', 1)[0] + "..."

            full_text = page.inner_text('body').lower()

            # Determine job type
            job_type = "full-time"
            if 'hlutastarf' in full_text or 'part-time' in full_text:
                job_type = "part-time"
            elif 'verktaki' in full_text or 'contract' in full_text:
                job_type = "contract"

            # Determine location
            location = "Iceland"
            if 'reykjavík' in full_text or 'reykjavik' in full_text:
                location = "Reykjavik, Iceland"
            elif 'akureyri' in full_text:
                location = "Akureyri, Iceland"

            return Job(
                company=company,
                title=title,
                description=description,
                category=guess_category(f"{title} {description}"),
                job_type=job_type,
                experience_level=guess_experience(f"{title} {description}"),
                location=location,
                remote=guess_remote(full_text),
                url=url,
                source="alfred"
            )

        except Exception as e:
            print(f"  Error parsing {url}: {e}")
            return None


# ---------------- Main ----------------

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description="Scrape startup job postings from Icelandic job boards"
    )
    parser.add_argument(
        '--merge', action='store_true',
        help="Merge scraped jobs into jobs-data.js (with deduplication)"
    )
    parser.add_argument(
        '--playwright', action='store_true',
        help="Use Playwright for alfred.is (handles JavaScript rendering)"
    )
    parser.add_argument(
        '--tvinna-only', action='store_true',
        help="Only scrape tvinna.is"
    )
    parser.add_argument(
        '--alfred-only', action='store_true',
        help="Only scrape alfred.is"
    )
    parser.add_argument(
        '--delay', type=float, default=1.0,
        help="Delay between requests in seconds (default: 1.0)"
    )
    args = parser.parse_args()

    # Paths
    script_dir = Path(__file__).resolve().parent
    startup_dir_path = script_dir.parent / "startup-directory" / "js" / "startups-data.js"
    jobs_data_path = script_dir / "js" / "jobs-data.js"

    if not startup_dir_path.exists():
        startup_dir_path = Path("/Users/Bala_1/dev/reykjavik-parking/wordpress-plugin/startup-directory/js/startups-data.js")

    if not startup_dir_path.exists():
        print(f"Error: Could not find startup directory at {startup_dir_path}")
        return

    print("Loading startup names from directory...")
    startup_names = load_startup_names(str(startup_dir_path))
    print(f"Loaded {len(startup_names)} startup name variations")

    all_jobs = []

    # Scrape tvinna.is
    if not args.alfred_only:
        print()
        tvinna = TvinnaScraper(delay=args.delay)
        tvinna_jobs = tvinna.scrape_all_jobs(startup_names, follow_details=True)
        all_jobs.extend(tvinna_jobs)

    # Scrape alfred.is
    if not args.tvinna_only:
        print()
        if args.playwright:
            if not PLAYWRIGHT_AVAILABLE:
                print("Error: Playwright not installed.")
                print("Install with: pip install playwright && playwright install chromium")
            else:
                alfred = AlfredPlaywrightScraper(headless=True, delay=args.delay)
                alfred_jobs = alfred.scrape_all_jobs(startup_names)
                all_jobs.extend(alfred_jobs)
        else:
            alfred = AlfredScraper(delay=args.delay)
            alfred_jobs = alfred.scrape_startup_jobs(startup_names)
            all_jobs.extend(alfred_jobs)

    print()
    print(f"Total startup jobs found: {len(all_jobs)}")

    # Convert to dict format
    jobs_data = [job.to_dict() for job in all_jobs]

    # Output JSON
    output_path = script_dir / "scraped_jobs.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(jobs_data, f, ensure_ascii=False, indent=2)
    print(f"Saved to {output_path}")

    # Merge into jobs-data.js if requested
    if args.merge:
        print()
        if not jobs_data_path.exists():
            print(f"Error: jobs-data.js not found at {jobs_data_path}")
        else:
            print("Merging into jobs-data.js...")
            added = merge_jobs_into_datafile(jobs_data, str(jobs_data_path))
            if added > 0:
                print(f"Successfully added {added} new jobs to jobs-data.js")

    # Print summary
    print("\nJobs by company:")
    companies = {}
    for job in all_jobs:
        companies[job.company] = companies.get(job.company, 0) + 1
    for company, count in sorted(companies.items(), key=lambda x: -x[1]):
        print(f"  {company}: {count}")


if __name__ == "__main__":
    main()
