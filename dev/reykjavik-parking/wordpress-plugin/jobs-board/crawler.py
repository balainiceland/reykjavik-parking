import json
import re
import time
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "StartupIcelandJobsBot/1.0 (+https://startupiceland.com/jobs/)"}

# ---------------- Schema ----------------
def make_job(company_name, job_title, description, category, job_type, experience_level,
             location, remote_option, application_url, featured="no") -> Dict:
    return {
        "company_name": company_name,
        "job_title": job_title,
        "description": description,
        "category": category,
        "type": job_type,
        "experience_level": experience_level,
        "location": location,
        "remote_option": remote_option,
        "application_url": application_url,
        "featured": featured,
    }

# ---------------- Heuristics ----------------
CATEGORY_RULES = [
    (re.compile(r"\b(engineer|developer|backend|frontend|full[- ]stack|devops|sre|data|ml|ai|scientist)\b", re.I), "Engineering"),
    (re.compile(r"\b(design|ux|ui|product designer|visual)\b", re.I), "Design"),
    (re.compile(r"\b(marketing|growth|content|seo|community)\b", re.I), "Marketing"),
    (re.compile(r"\b(sales|account executive|ae|sdr|bdr|revenue)\b", re.I), "Sales"),
    (re.compile(r"\b(operations|ops|people|hr|talent|recruit)\b", re.I), "Operations"),
    (re.compile(r"\b(product manager|pm|product)\b", re.I), "Product"),
    (re.compile(r"\b(finance|accountant|controller|cfo)\b", re.I), "Finance"),
]
TYPE_RULES = [
    (re.compile(r"\b(intern|internship)\b", re.I), "Internship"),
    (re.compile(r"\b(contract|freelance)\b", re.I), "Contract"),
    (re.compile(r"\b(part[- ]time)\b", re.I), "Part-time"),
]
EXPERIENCE_RULES = [
    (re.compile(r"\b(chief|vp|head of|director|cxo|cto|ceo)\b", re.I), "Executive"),
    (re.compile(r"\b(lead|principal|staff)\b", re.I), "Lead"),
    (re.compile(r"\b(senior|sr\.)\b", re.I), "Senior"),
    (re.compile(r"\b(mid|intermediate)\b", re.I), "Mid"),
    (re.compile(r"\b(junior|jr\.|entry|graduate)\b", re.I), "Entry"),
]
REMOTE_RULES = [
    (re.compile(r"\b(remote)\b", re.I), "Remote"),
    (re.compile(r"\b(hybrid)\b", re.I), "Hybrid"),
    (re.compile(r"\b(on[- ]site|onsite)\b", re.I), "Onsite"),
]

def guess_category(title: str) -> str:
    for rx, cat in CATEGORY_RULES:
        if rx.search(title):
            return cat
    return "Other"

def guess_type(text: str) -> str:
    for rx, t in TYPE_RULES:
        if rx.search(text):
            return t
    return "Full-time"

def guess_experience(text: str) -> str:
    for rx, lvl in EXPERIENCE_RULES:
        if rx.search(text):
            return lvl
    return "Mid"

def guess_remote(text: str) -> str:
    for rx, opt in REMOTE_RULES:
        if rx.search(text):
            return opt
    return "Onsite"

def clean_text(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()

# ---------------- Source config ----------------
@dataclass
class Source:
    company_name: str
    careers_url: str
    default_location: str = "Iceland"
    featured: str = "no"
    parser: str = "auto"  # auto|generic|climeworks|ccp|umsokn

# ---------------- Crawler ----------------
class Crawler:
    def __init__(self, timeout: int = 20, delay_s: float = 0.6):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.timeout = timeout
        self.delay_s = delay_s

    def fetch(self, url: str) -> Optional[str]:
        try:
            r = self.session.get(url, timeout=self.timeout)
            if r.status_code >= 400:
                return None
            return r.text
        except requests.RequestException:
            return None

    # ------ Parsers ------
    def extract_job_links_generic(self, html: str, base_url: str) -> List[Dict]:
        soup = BeautifulSoup(html, "lxml")
        out, seen = [], set()
        jobish = re.compile(r"(careers|jobs|positions|vacanc|job)", re.I)
        bad = re.compile(r"(privacy|cookie|terms|facebook\.com|twitter\.com|instagram\.com)", re.I)

        for a in soup.select("a[href]"):
            href = (a.get("href") or "").strip()
            title = clean_text(a.get_text(" ", strip=True))
            if not href or len(title) < 3:
                continue
            url = urljoin(base_url, href)
            if bad.search(url):
                continue
            if not jobish.search(url) and not re.search(r"\b(apply|role|position|opening|read more)\b", title, re.I):
                continue

            key = (title.lower(), url)
            if key in seen:
                continue
            seen.add(key)
            out.append({"title": title, "url": url, "location": "", "type": ""})

        out = [x for x in out if not re.fullmatch(r"(careers|jobs|open positions|open roles)", x["title"], re.I)]
        return out

    def extract_jobs_climeworks(self, html: str, base_url: str) -> List[Dict]:
        soup = BeautifulSoup(html, "lxml")
        out, seen = [], set()
        for a in soup.select('a[href^="/jobs/"], a[href*="/jobs/"]'):
            title = clean_text(a.get_text(" ", strip=True))
            if len(title) < 3:
                continue
            url = urljoin(base_url, a["href"])
            key = (title.lower(), url)
            if key in seen:
                continue
            seen.add(key)
            out.append({"title": title, "url": url, "location": "", "type": ""})
        return out

    def extract_jobs_ccp(self, html: str, base_url: str) -> List[Dict]:
        soup = BeautifulSoup(html, "lxml")
        out, seen = [], set()
        for a in soup.select('a[href*="/en/postings/"]'):
            href = (a.get("href") or "").strip()
            title = clean_text(a.get_text(" ", strip=True))
            if not href or len(title) < 3:
                continue
            url = urljoin(base_url, href)
            key = (title.lower(), url)
            if key in seen:
                continue
            seen.add(key)
            out.append({"title": title, "url": url, "location": "", "type": ""})
        return out

    def parse_ccp_details(self, html: str) -> Dict[str, str]:
        soup = BeautifulSoup(html, "lxml")

        def find_value(label: str) -> str:
            lab = soup.find(string=re.compile(rf"^{re.escape(label)}$", re.I))
            if not lab:
                return ""
            node = lab.parent
            for _ in range(10):
                node = node.find_next()
                if not node:
                    break
                txt = clean_text(node.get_text(" ", strip=True)) if hasattr(node, "get_text") else ""
                if txt and txt.lower() != label.lower():
                    return txt
            return ""

        return {
            "department": find_value("Department"),
            "employment_type": find_value("Employment Type"),
            "location": find_value("Location"),
            "workplace": find_value("Workplace type"),
        }

    def extract_jobs_umsokn(self, html: str, base_url: str) -> List[Dict]:
        soup = BeautifulSoup(html, "lxml")
        out, seen = [], set()
        for a in soup.select("a[href]"):
            href = (a.get("href") or "").strip()
            text = clean_text(a.get_text(" ", strip=True))
            if not href or not text:
                continue
            if not re.search(r"/[a-z]{2}/\d+$", href):
                continue

            url = urljoin(base_url, href)
            title = re.split(r"\bApplication deadline\b|\bUmsóknarfrestur\b", text, maxsplit=1)[0].strip()
            if len(title) < 3:
                continue

            job_type = "Full-time"
            if re.search(r"\bPart time\b|\bHlutastarf\b", text, re.I):
                job_type = "Part-time"
            if re.search(r"\bContract\b|\bVerkefni\b", text, re.I):
                job_type = "Contract"
            if re.search(r"\bIntern\b|\bStarfsnám\b", text, re.I):
                job_type = "Internship"

            key = (title.lower(), url)
            if key in seen:
                continue
            seen.add(key)

            out.append({"title": title, "url": url, "location": "", "type": job_type})
        return out

    def extract_description_snippet(self, html: str) -> str:
        soup = BeautifulSoup(html, "lxml")
        main = soup.find("main") or soup.find("article") or soup.find("section") or soup.body
        if not main:
            return ""
        for tag in main.find_all(["script", "style", "nav", "footer", "header", "noscript"]):
            tag.decompose()
        text = clean_text(main.get_text(" ", strip=True))
        if len(text) > 350:
            text = text[:350].rsplit(" ", 1)[0] + "…"
        return text

    # ------ Parser auto-detection ------
    def detect_parser(self, url: str) -> str:
        u = url.lower()
        if "climeworks.com/jobs" in u:
            return "climeworks"
        if "careers.ccpgames.com" in u:
            return "ccp"
        if "umsokn.is" in u:
            return "umsokn"
        if "syndis.com/careers" in u:
            # careers page redirects users to umsokn; we’ll rewrite it later
            return "syndis"
        return "generic"

    def normalize_source(self, s: Source) -> Source:
        # Rewrite known “pointer” pages
        if "syndis.com/careers" in s.careers_url.lower():
            # go straight to ATS in English
            s.careers_url = "https://syndis.umsokn.is/en"
            s.parser = "umsokn"
            if not s.company_name:
                s.company_name = "Syndis"
        return s

    def crawl_source(self, source: Source, follow_job_pages: bool = True, max_jobs: int = 120) -> List[Dict]:
        source = self.normalize_source(source)

        html = self.fetch(source.careers_url)
        time.sleep(self.delay_s)
        if not html:
            return []

        parser = source.parser
        if parser == "auto":
            parser = self.detect_parser(source.careers_url)

        default_remote = "Onsite"
        if parser == "climeworks":
            jobs = self.extract_jobs_climeworks(html, source.careers_url)
            default_remote = "Hybrid"
        elif parser == "ccp":
            jobs = self.extract_jobs_ccp(html, source.careers_url)
        elif parser in ("umsokn",):
            jobs = self.extract_jobs_umsokn(html, source.careers_url)
        else:
            jobs = self.extract_job_links_generic(html, source.careers_url)

        jobs = jobs[:max_jobs]
        out: List[Dict] = []

        for j in jobs:
            title = j["title"]
            url = j["url"]
            loc = j.get("location") or source.default_location

            desc = ""
            inferred_text = f"{title} {loc}"

            job_type = j.get("type") or "Full-time"
            remote = default_remote
            category = guess_category(title)

            # Follow job pages for richer data (skip umsokn)
            if follow_job_pages and parser not in ("umsokn",):
                job_html = self.fetch(url)
                time.sleep(self.delay_s)
                if job_html:
                    desc = self.extract_description_snippet(job_html)
                    inferred_text = f"{title} {loc} {desc}"

                if parser == "ccp" and job_html:
                    details = self.parse_ccp_details(job_html)

                    if details.get("location"):
                        loc = details["location"]

                    wp = (details.get("workplace") or "").lower()
                    if "remote" in wp:
                        remote = "Remote"
                    elif "hybrid" in wp:
                        remote = "Hybrid"
                    elif "onsite" in wp or "on site" in wp:
                        remote = "Onsite"

                    et = (details.get("employment_type") or "").lower()
                    if "part" in et:
                        job_type = "Part-time"
                    elif "contract" in et:
                        job_type = "Contract"
                    else:
                        job_type = "Full-time"

            # Fill remaining from heuristics
            job_type = job_type or guess_type(inferred_text)
            exp = guess_experience(inferred_text)
            remote = remote if remote else guess_remote(inferred_text)
            category = category or guess_category(title)

            out.append(
                make_job(
                    company_name=source.company_name,
                    job_title=title,
                    description=desc,
                    category=category,
                    job_type=job_type,
                    experience_level=exp,
                    location=loc,
                    remote_option=remote,
                    application_url=url,
                    featured=source.featured,
                )
            )

        return out

# ---------------- File-driven sources ----------------
def infer_company_name_from_url(url: str) -> str:
    host = urlparse(url).netloc.replace("www.", "")
    # keep it simple: domain -> Title Case
    base = host.split(":")[0].split(".")[0]
    return base.replace("-", " ").title()

def parse_sources_file(path: str) -> List[Source]:
    sources: List[Source] = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            parts = [p.strip() for p in line.split("|")]
            if len(parts) == 1:
                url = parts[0]
                sources.append(Source(company_name=infer_company_name_from_url(url), careers_url=url, parser="auto"))
            elif len(parts) == 2:
                company, url = parts
                sources.append(Source(company_name=company, careers_url=url, parser="auto"))
            else:
                company, url, parser = parts[0], parts[1], parts[2]
                sources.append(Source(company_name=company, careers_url=url, parser=parser))
    return sources

def main():
    sources = parse_sources_file("sources.txt")
    crawler = Crawler(timeout=20, delay_s=0.6)

    all_jobs: List[Dict] = []
    for s in sources:
        all_jobs.extend(crawler.crawl_source(s, follow_job_pages=True))

    print(json.dumps(all_jobs, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
