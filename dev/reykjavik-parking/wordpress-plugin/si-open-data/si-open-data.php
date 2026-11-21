<?php
/**
 * Plugin Name: Startup Iceland Open Data
 * Plugin URI: https://startupiceland.com
 * Description: Makes the startup, investor and jobs data easy for people and AI tools to find and reuse: /llms.txt, open data endpoints (JSON and CSV), an "ecosystem in numbers" page, a page for every startup and investor, and a sitemap of them.
 * Version: 1.3.0
 * Author: Startup Iceland
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Reads the same data files as the directory plugins and the jobs board, so there is one
 * source for each list:
 *   startups  wp-content/plugins/startup-directory/js/startups-data.json
 *   investors wp-content/plugins/investor-directory/js/investors-data.json
 *   jobs      the open jobs the jobs board plugin keeps (option sjb_open_jobs_last,
 *             refreshed hourly from github.com/balainiceland/iceland-jobs-data)
 */
class Startup_Iceland_Open_Data {

    const VERSION = '1.3.0';
    const NS = 'startupiceland/v1';
    const LICENSE = 'CC BY 4.0';
    const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';
    const ATTRIBUTION = 'Startup Iceland (startupiceland.com)';
    const NUMBERS_PATH = '/iceland-startup-ecosystem-in-numbers/';

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('parse_request', array($this, 'serve_llms_txt'), 0);
        add_action('parse_request', array($this, 'serve_sitemap'), 0);
        add_action('init', array($this, 'add_rewrites'));
        add_filter('query_vars', array($this, 'query_vars'));
        add_action('template_redirect', array($this, 'serve_profile'), 0);
        add_filter('robots_txt', array($this, 'robots_txt'), 20);
        add_filter('wp_robots', array($this, 'robots_meta'), 20);
        add_action('rest_api_init', array($this, 'register_routes'));
        add_shortcode('si_ecosystem_numbers', array($this, 'render_numbers'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        add_filter('the_content', array($this, 'series_note'), 20);
        add_action('wp_head', array($this, 'series_note_style'));
        add_action('save_post_page', array($this, 'forget_topics'));
    }

    // ---------------------------------------------------------------- data

    private function read_json($relative) {
        $path = WP_PLUGIN_DIR . '/' . $relative;
        if (!is_readable($path)) {
            return array();
        }
        $data = json_decode(file_get_contents($path), true);
        return is_array($data) ? $data : array();
    }

    private function names($list) {
        $names = array();
        foreach ((array) $list as $key => $item) {
            if (is_array($item) && isset($item['id'], $item['name'])) {
                if ('all' !== $item['id']) {
                    $names[$item['id']] = $item['name'];
                }
            } elseif (is_string($item)) {
                $names[$key] = $item;  // the jobs file uses {"id": "Label"}
            }
        }
        return $names;
    }

    private function by_name($rows) {
        usort($rows, function ($a, $b) {
            return strcasecmp(remove_accents((string) ($a['name'] ?? '')), remove_accents((string) ($b['name'] ?? '')));
        });
        return $rows;
    }

    private function date_of($iso) {
        $t = $iso ? strtotime($iso) : false;
        return $t ? gmdate('Y-m-d', $t) : null;
    }

    public function startups() {
        $data = $this->read_json('startup-directory/js/startups-data.json');
        $sectors = $this->names($data['sectors'] ?? array());
        $rows = array();
        foreach ((array) ($data['startups'] ?? array()) as $s) {
            if (!is_array($s) || empty($s['name'])) {
                continue;
            }
            $rows[] = array(
                'id'          => (int) ($s['id'] ?? 0),
                'name'        => $s['name'],
                'url'         => $this->profile_url('startup', (int) ($s['id'] ?? 0), $s['name']),
                'description' => $s['description'] ?? '',
                'website'     => $s['website'] ?? '',
                'sector'      => $sectors[$s['sector'] ?? ''] ?? ($s['sector'] ?? ''),
                'status'      => $s['status'] ?? 'active',
                'acquired_by' => $s['acquiredBy'] ?? null,
                'founded'     => $s['foundedYear'] ?? null,
            );
        }
        return array('updated' => $this->date_of($data['lastUpdated'] ?? ''), 'rows' => $this->by_name($rows));
    }

    public function investors() {
        $data = $this->read_json('investor-directory/js/investors-data.json');
        $types = $this->names($data['types'] ?? array());
        $stages = $this->names($data['stages'] ?? array());
        $sectors = $this->names($data['sectors'] ?? array());
        $label = function ($ids, $names) {
            return array_values(array_map(function ($id) use ($names) {
                return $names[$id] ?? $id;
            }, (array) $ids));
        };
        $rows = array();
        foreach ((array) ($data['investors'] ?? array()) as $i) {
            if (!is_array($i) || empty($i['name'])) {
                continue;
            }
            $rows[] = array(
                'id'          => (int) ($i['id'] ?? 0),
                'name'        => $i['name'],
                'url'         => $this->profile_url('investor', (int) ($i['id'] ?? 0), $i['name']),
                'type'        => $types[$i['type'] ?? ''] ?? ($i['type'] ?? ''),
                'description' => $i['description'] ?? '',
                'website'     => $i['website'] ?? '',
                'sectors'     => $label($i['focus'] ?? array(), $sectors),
                'stages'      => $label($i['stages'] ?? array(), $stages),
                'ticket_size' => $i['ticketSize'] ?? null,
                'portfolio'   => array_values((array) ($i['portfolio'] ?? array())),
                'founded'     => $i['foundedYear'] ?? null,
                'location'    => $i['location'] ?? null,
            );
        }
        return array('updated' => $this->date_of($data['lastUpdated'] ?? ''), 'rows' => $this->by_name($rows));
    }

    public function jobs() {
        $data = get_option('sjb_open_jobs_last');
        $data = is_array($data) ? $data : array();
        $categories = $this->names($data['categories'] ?? array());
        $types = $this->names($data['types'] ?? array());
        $remote = $this->names($data['remoteOptions'] ?? array());
        $rows = array();
        foreach ((array) ($data['jobs'] ?? array()) as $j) {
            if (!is_array($j) || empty($j['title'])) {
                continue;
            }
            $rows[] = array(
                'title'           => $j['title'],
                'company'         => $j['company'] ?? '',
                'startup'         => !empty($j['startup']),
                'category'        => $categories[$j['category'] ?? ''] ?? ($j['category'] ?? ''),
                'type'            => $types[$j['type'] ?? ''] ?? ($j['type'] ?? ''),
                'workplace'       => $remote[$j['remote'] ?? ''] ?? ($j['remote'] ?? ''),
                'location'        => $j['location'] ?? '',
                'posted'          => $this->date_of($j['postedDate'] ?? ''),
                'application_url' => $j['applicationUrl'] ?? '',
            );
        }
        usort($rows, function ($a, $b) {
            return strcmp((string) $b['posted'], (string) $a['posted']);
        });
        return array('updated' => $this->date_of($data['lastUpdated'] ?? ''), 'rows' => $rows);
    }

    // ---------------------------------------------------------------- REST: JSON and CSV

    public function register_routes() {
        $lists = array(
            'startups'  => 'Icelandic startups and technology companies: active, acquired and exited.',
            'investors' => 'Venture capital firms, angel investors, government funds and accelerators investing in Icelandic startups.',
            'jobs'      => 'Open jobs on the Startup Iceland jobs board (startups and other Icelandic employers).',
        );
        // The directories are Startup Iceland's own work. Job postings belong to the employers
        // and job sites they come from (the jobs research data excludes them from its licence too).
        $licensed = array('startups' => true, 'investors' => true, 'jobs' => false);
        foreach ($lists as $name => $description) {
            register_rest_route(self::NS, '/' . $name, array(
                'methods'             => 'GET',
                'permission_callback' => '__return_true',
                'args'                => array('format' => array('enum' => array('json', 'csv'), 'default' => 'json')),
                'callback'            => function ($request) use ($name, $description) {
                    $list = $this->$name();
                    if ('csv' === $request->get_param('format')) {
                        $this->send_csv($name, $list['rows']);
                    }
                    $terms = $licensed[$name]
                        ? array('license' => self::LICENSE, 'license_url' => self::LICENSE_URL, 'attribution' => 'Please credit ' . self::ATTRIBUTION)
                        : array('license' => null, 'license_url' => null,
                                'attribution' => 'Job postings belong to their employers and the job sites they were collected from; '
                                    . 'this list is provided for reference and is not covered by Startup Iceland\'s CC BY 4.0 licence.');
                    return new WP_REST_Response(array_merge(array(
                        'name'        => $name,
                        'description' => $description,
                        'source'      => home_url('/'),
                    ), $terms, array(
                        'updated'     => $list['updated'],
                        'count'       => count($list['rows']),
                        'csv'         => rest_url(self::NS . '/' . $name) . '?format=csv',
                        'items'       => $list['rows'],
                    )));
                },
            ));
        }
    }

    private function send_csv($name, $rows) {
        nocache_headers();
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: inline; filename="startupiceland-' . $name . '.csv"');
        $out = fopen('php://output', 'w');
        fwrite($out, "\xEF\xBB\xBF");  // so Excel reads Icelandic letters correctly
        if ($rows) {
            fputcsv($out, array_keys($rows[0]), ',', '"', '');
            foreach ($rows as $row) {
                fputcsv($out, array_map(function ($v) {
                    $v = is_array($v) ? implode('; ', $v) : (is_bool($v) ? ($v ? 'yes' : 'no') : (string) $v);
                    // Cells that a spreadsheet would run as a formula start with a quote instead
                    return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;
                }, $row), ',', '"', '');
            }
        }
        fclose($out);
        exit;
    }

    // ---------------------------------------------------------------- /llms.txt

    public function serve_llms_txt($wp) {
        $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
        if ('llms.txt' !== $path) {
            return;
        }
        header('Content-Type: text/plain; charset=utf-8');  // Markdown, served as text so browsers show it
        header('Cache-Control: public, max-age=3600');
        header('X-Robots-Tag: noindex');  // for AI tools to read, not for search results
        echo $this->llms_txt();
        exit;
    }

    public function llms_txt() {
        $s = $this->startups();
        $i = $this->investors();
        $j = $this->jobs();
        $active = count(array_filter($s['rows'], function ($r) { return 'active' === $r['status']; }));
        $acquired = count(array_filter($s['rows'], function ($r) { return 'acquired' === $r['status']; }));
        $api = rest_url(self::NS);
        $site = home_url('/');
        $lines = array(
            '# Startup Iceland',
            '',
            '> Startup Iceland is a resource for founders, investors and job seekers in Iceland\'s startup ecosystem, running since 2009. '
                . 'It keeps a curated directory of Icelandic startups, a directory of the investors who fund them, and a jobs board updated daily.',
            '',
            'The startup and investor directories are free to reuse under ' . self::LICENSE . ' (' . self::LICENSE_URL . '): please credit ' . self::ATTRIBUTION . '. '
                . 'Job postings belong to their employers and are listed for reference only.',
            '',
            '## Directories and jobs',
            '',
            sprintf('- [Iceland startup directory](%s): %d startups (%d active, %d acquired), each with sector, year founded and website, and its own page at /startup/{id}-{name}/. Updated %s.',
                $site . 'iceland-startup-directory/', count($s['rows']), $active, $acquired, $s['updated'] ?: 'regularly'),
            sprintf('- [Investors in Icelandic startups](%s): %d venture capital firms, angels, government funds and accelerators, with stages, ticket sizes and portfolios, each with its own page at /investor/{id}-{name}/. Updated %s.',
                $site . 'investors/', count($i['rows']), $i['updated'] ?: 'regularly'),
            sprintf('- [Startup jobs in Iceland](%s): %d open jobs at startups and other Icelandic employers, collected daily from Alfreð, Starfatorg, Tvinna and company career pages. Data as of %s.',
                $site . 'jobs/', count($j['rows']), $j['updated'] ?: 'the last collection'),
            sprintf('- [Iceland\'s startup ecosystem in numbers](%s): the directories summarised by sector, status, founding year and investor type.', $site . ltrim(self::NUMBERS_PATH, '/')),
            sprintf('- [Iceland\'s changing world of work](%s): research on how Iceland\'s job market is changing with AI, from job postings collected daily since January 2026 (figures CC BY 4.0).', $site . 'changing-world-of-work/'),
            '',
            '## Open data (JSON; add ?format=csv for CSV)',
            '',
            sprintf('- [Startups](%s/startups)', $api),
            sprintf('- [Investors](%s/investors)', $api),
            sprintf('- [Open jobs](%s/jobs)', $api),
            '- [Jobs research figures](https://github.com/balainiceland/iceland-jobs-data): daily aggregate figures on Iceland\'s job market.',
            sprintf('- [Sitemap of every startup and investor page](%s)', $site . 'si-sitemap.xml'),
            '',
        );
        $topics = $this->topics();
        if ($topics) {
            $lines[] = '## Writing by topic';
            $lines[] = '';
            foreach ($topics as $t) {
                $lines[] = sprintf('- [%s](%s): %s', $t['title'], $t['url'], $t['excerpt']);
            }
            $lines[] = '';
        }
        array_push($lines,
            '## Optional',
            '',
            sprintf('- [Blog](%s): essays on entrepreneurship and the Icelandic ecosystem since 2004; the topic pages above gather the main series.', $site . 'blog/'),
            '- Corrections and additions: bala@startupiceland.com',
            ''
        );
        return implode("\n", $lines);
    }

    // ---------------------------------------------------------------- topic pages (/topics/...)

    /**
     * The published child pages of /topics/, each with the posts it links to. The topic pages are
     * the source of truth: edit one and llms.txt and the "part of a series" notes follow.
     */
    public function topics() {
        $cached = get_transient('si_topics_v1');
        if (is_array($cached)) {
            return $cached;
        }
        $topics = array();
        $parent = get_page_by_path('topics');
        if ($parent && 'publish' === $parent->post_status) {
            $pages = get_pages(array('parent' => $parent->ID, 'post_status' => 'publish', 'sort_column' => 'menu_order,ID'));
            foreach ($pages as $page) {
                preg_match_all('#href="(https?://[^"]+/\d{4}/\d{2}/\d{2}/[^"/]+/?)"#', $page->post_content, $m);
                $posts = array();
                foreach (array_unique($m[1]) as $url) {
                    $id = url_to_postid($url);
                    if ($id) {
                        $posts[] = $id;
                    }
                }
                $topics[] = array(
                    'title'   => $page->post_title,
                    'url'     => get_permalink($page),
                    'excerpt' => wp_strip_all_tags($page->post_excerpt),
                    'posts'   => $posts,
                );
            }
        }
        set_transient('si_topics_v1', $topics, 12 * HOUR_IN_SECONDS);
        return $topics;
    }

    public function forget_topics() {
        delete_transient('si_topics_v1');
    }

    private function series_for($post_id) {
        return array_values(array_filter($this->topics(), function ($t) use ($post_id) {
            return in_array((int) $post_id, $t['posts'], true);
        }));
    }

    public function series_note($content) {
        if (!is_singular('post') || !in_the_loop() || !is_main_query()) {
            return $content;
        }
        $series = $this->series_for(get_the_ID());
        if (!$series) {
            return $content;
        }
        $links = array_map(function ($t) {
            return '<a href="' . esc_url($t['url']) . '">' . esc_html($t['title']) . '</a>';
        }, $series);
        $label = count($series) > 1 ? 'Part of these series' : 'Part of a series';
        return $content . '<aside class="sio-series-note"><p><strong>' . $label . ':</strong> '
            . implode(' · ', $links) . '. Read every post in order on the topic page.</p></aside>';
    }

    public function series_note_style() {
        if (is_singular('post') && $this->series_for(get_queried_object_id())) {
            echo '<style>.sio-series-note{margin:2em 0 0;padding:14px 18px;border-left:4px solid #6D2D6C;background:#F6F1F6}.sio-series-note p{margin:0}</style>' . "\n";
        }
    }

    // ---------------------------------------------------------------- a page for every startup and investor

    /**
     * /startup/{id}-{name}/ and /investor/{id}-{name}/. The id finds the entry; the name is only
     * for people, so an old or mistyped name redirects (301) to the current address. Addresses
     * are built here and in the directories' JS from the same id, so they never go stale when
     * a name is corrected.
     */
    public function profile_url($kind, $id, $name) {
        $slug = sanitize_title($name);
        return home_url('/' . $kind . '/' . (int) $id . ($slug ? '-' . $slug : '') . '/');
    }

    public function add_rewrites() {
        add_rewrite_rule('^(startup|investor)/([0-9]+)(?:-[^/]*)?/?$', 'index.php?si_entity=$matches[1]&si_id=$matches[2]', 'top');
        // New rules only take effect after a flush; do it once per plugin version, not on every request.
        if (get_option('si_open_data_rewrites') !== self::VERSION) {
            flush_rewrite_rules(false);
            update_option('si_open_data_rewrites', self::VERSION);
        }
    }

    public function query_vars($vars) {
        $vars[] = 'si_entity';
        $vars[] = 'si_id';
        return $vars;
    }

    private function norm($name) {
        $name = strtolower(remove_accents(html_entity_decode((string) $name)));
        $name = preg_replace('/\s+(ehf|hf|ohf|slhf|ses)\.?$/', '', trim($name));
        $name = trim(preg_replace('/[^a-z0-9]+/', ' ', $name));
        // "Treble Technologies" in the directory is "Treble" in a portfolio
        $short = preg_replace('/ (technologies|technology|tech|software|labs|group|inc|ltd)$/', '', $name);
        return '' !== $short ? $short : $name;
    }

    private function find($rows, $id) {
        foreach ($rows as $row) {
            if ((int) $row['id'] === (int) $id) {
                return $row;
            }
        }
        return null;
    }

    public function serve_profile() {
        $kind = get_query_var('si_entity');
        if (!in_array($kind, array('startup', 'investor'), true)) {
            return;
        }
        $row = $this->find('startup' === $kind ? $this->startups()['rows'] : $this->investors()['rows'], get_query_var('si_id'));
        if (!$row) {
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            nocache_headers();
            return;  // the theme's 404 page
        }
        $path = (string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
        if (untrailingslashit($path) !== untrailingslashit((string) wp_parse_url($row['url'], PHP_URL_PATH))) {
            wp_safe_redirect($row['url'], 301);
            exit;
        }

        $html = 'startup' === $kind ? $this->startup_page($row) : $this->investor_page($row);
        $summary = wp_strip_all_tags($row['description']);
        $title = $row['name'] . ('startup' === $kind ? ' – Icelandic startup' : ' – investor in Icelandic startups') . ' | Startup Iceland';
        add_filter('pre_get_document_title', function () use ($title) { return $title; }, 99);
        add_filter('wp_title', function () use ($title) { return $title; }, 99);
        add_filter('body_class', function ($c) { $c[] = 'sio-profile-page'; return $c; });
        remove_action('wp_head', 'rel_canonical');
        // Jetpack would describe these pages as the blog index (og:url /blog/, the site description, a
        // "Home > Blog" breadcrumb), since they are not WordPress posts; the tags below replace them.
        add_filter('jetpack_enable_open_graph', '__return_false', 99);
        add_filter('jetpack_seo_meta_tags', function ($meta) { unset($meta['description']); return $meta; }, 99);
        remove_action('wp_head', array('Automattic\Jetpack\SEO\Schema_Builder', 'emit'), 5);
        add_action('wp_head', function () use ($row, $summary, $title) {
            $image = get_site_icon_url(512);
            if ($image) {
                echo '<meta property="og:image" content="' . esc_url($image) . '" />' . "\n";
            }
            echo '<meta property="og:site_name" content="Startup Iceland" />' . "\n";
            echo '<link rel="canonical" href="' . esc_url($row['url']) . '" />' . "\n";
            echo '<meta name="description" content="' . esc_attr(wp_trim_words($summary, 40, '…')) . '" />' . "\n";
            echo '<meta property="og:type" content="profile" />' . "\n";
            echo '<meta property="og:title" content="' . esc_attr($title) . '" />' . "\n";
            echo '<meta property="og:description" content="' . esc_attr(wp_trim_words($summary, 40, '…')) . '" />' . "\n";
            echo '<meta property="og:url" content="' . esc_url($row['url']) . '" />' . "\n";
        }, 1);
        wp_enqueue_style('si-open-data-css', plugin_dir_url(__FILE__) . 'css/numbers.css', array(), self::VERSION);
        status_header(200);
        get_header();
        echo $html;
        get_footer();
        exit;
    }

    private function fact($label, $value_html) {
        return $value_html ? '<div class="sio-fact"><dt>' . esc_html($label) . '</dt><dd>' . $value_html . '</dd></div>' : '';
    }

    private function breadcrumb_ld($list_name, $list_url, $row) {
        return array('@type' => 'BreadcrumbList', 'itemListElement' => array(
            array('@type' => 'ListItem', 'position' => 1, 'name' => 'Startup Iceland', 'item' => home_url('/')),
            array('@type' => 'ListItem', 'position' => 2, 'name' => $list_name, 'item' => $list_url),
            array('@type' => 'ListItem', 'position' => 3, 'name' => $row['name'], 'item' => $row['url']),
        ));
    }

    private function json_ld_script($graph) {
        return '<script type="application/ld+json">'
            . wp_json_encode(array('@context' => 'https://schema.org', '@graph' => $graph),
                             JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP)
            . '</script>';
    }

    private function external_link($url, $label) {
        if (!is_string($url) || !preg_match('#^https?://#i', $url)) {
            return '';
        }
        return '<a href="' . esc_url($url) . '" target="_blank" rel="noopener">' . esc_html($label) . '</a>';
    }

    private function startup_page($s) {
        $list_url = home_url('/iceland-startup-directory/');
        $key = $this->norm($s['name']);
        $backers = array_values(array_filter($this->investors()['rows'], function ($i) use ($key) {
            foreach ((array) $i['portfolio'] as $p) {
                if ($this->norm($p) === $key) {
                    return true;
                }
            }
            return false;
        }));
        $jobs = array_values(array_filter($this->jobs()['rows'], function ($j) use ($key) {
            return $this->norm(explode('|', $j['company'])[0]) === $key;
        }));
        $status = ucfirst($s['status'] ?: 'active');
        $host = $s['website'] ? preg_replace('#^www\.#', '', (string) wp_parse_url($s['website'], PHP_URL_HOST)) : '';

        $h  = '<div class="sio-numbers sio-profile" id="sio-numbers">';
        $h .= '<nav class="sio-crumbs" aria-label="Breadcrumb"><a href="' . esc_url($list_url) . '">Iceland startup directory</a> <span aria-hidden="true">/</span> ' . esc_html($s['name']) . '</nav>';
        $h .= '<header class="sio-hero"><p class="sio-eyebrow">Icelandic startup · ' . esc_html($s['sector']) . '</p>';
        $h .= '<h1 class="sio-title">' . esc_html($s['name']) . '</h1>';
        if ($s['description']) {
            $h .= '<p class="sio-lead">' . esc_html($s['description']) . '</p>';
        }
        $h .= '</header><section class="sio-section"><h2>Facts</h2><dl class="sio-facts">';
        $h .= $this->fact('Status', esc_html($status) . ('acquired' === $s['status'] && $s['acquired_by'] ? ' by ' . esc_html($s['acquired_by']) : ''));
        $h .= $this->fact('Sector', esc_html($s['sector']));
        $h .= $this->fact('Founded', $s['founded'] ? esc_html($s['founded']) : '');
        $h .= $this->fact('Website', $this->external_link($s['website'], $host ?: $s['website']));
        $h .= '</dl></section>';
        if ($backers) {
            $h .= '<section class="sio-section"><h2>Investors</h2><p>Investors in the Startup Iceland directory that list ' . esc_html($s['name']) . ' in their portfolio:</p><ul>';
            foreach ($backers as $b) {
                $h .= '<li><a href="' . esc_url($b['url']) . '">' . esc_html($b['name']) . '</a> (' . esc_html($b['type']) . ')</li>';
            }
            $h .= '</ul></section>';
        }
        if ($jobs) {
            $h .= '<section class="sio-section"><h2>Open jobs</h2><ul>';
            foreach ($jobs as $j) {
                $h .= '<li>' . ($this->external_link($j['application_url'], $j['title']) ?: esc_html($j['title']))
                    . ' · ' . esc_html($j['type']) . ($j['posted'] ? ' · posted ' . esc_html($j['posted']) : '') . '</li>';
            }
            $h .= '</ul><p><a href="' . esc_url(home_url('/jobs/')) . '">All startup jobs in Iceland</a></p></section>';
        }
        $h .= '<p class="sio-source">From the <a href="' . esc_url($list_url) . '">Iceland startup directory</a> by Startup Iceland, free to reuse under CC BY 4.0. '
            . 'Something wrong or out of date? Write to <a href="mailto:bala@startupiceland.com">bala@startupiceland.com</a>.</p>';

        $org = array('@type' => 'Organization', '@id' => $s['url'] . '#org', 'name' => $s['name'], 'url' => $s['website'] ?: $s['url'],
                     'description' => $s['description'], 'mainEntityOfPage' => $s['url']);
        if ($s['founded']) {
            $org['foundingDate'] = (string) $s['founded'];
        }
        if ($s['sector']) {
            $org['keywords'] = $s['sector'];
        }
        if ('acquired' === $s['status'] && $s['acquired_by']) {
            $org['parentOrganization'] = array('@type' => 'Organization', 'name' => $s['acquired_by']);
        }
        if ($backers) {
            $org['funder'] = array_map(function ($b) {
                return array('@type' => 'Organization', 'name' => $b['name'], 'url' => $b['url']);
            }, $backers);
        }
        $h .= $this->json_ld_script(array($org, $this->breadcrumb_ld('Iceland startup directory', $list_url, $s)));
        return $h . '</div>';
    }

    private function investor_page($i) {
        $list_url = home_url('/investors/');
        $startups = array();
        foreach ($this->startups()['rows'] as $s) {
            $startups[$this->norm($s['name'])] = $s;
        }
        $host = $i['website'] ? preg_replace('#^www\.#', '', (string) wp_parse_url($i['website'], PHP_URL_HOST)) : '';

        $h  = '<div class="sio-numbers sio-profile" id="sio-numbers">';
        $h .= '<nav class="sio-crumbs" aria-label="Breadcrumb"><a href="' . esc_url($list_url) . '">Investors in Icelandic startups</a> <span aria-hidden="true">/</span> ' . esc_html($i['name']) . '</nav>';
        $h .= '<header class="sio-hero"><p class="sio-eyebrow">Investor · ' . esc_html($i['type']) . '</p>';
        $h .= '<h1 class="sio-title">' . esc_html($i['name']) . '</h1>';
        if ($i['description']) {
            $h .= '<p class="sio-lead">' . esc_html($i['description']) . '</p>';
        }
        $h .= '</header><section class="sio-section"><h2>Facts</h2><dl class="sio-facts">';
        $h .= $this->fact('Type', esc_html($i['type']));
        $h .= $this->fact('Stages', esc_html(implode(', ', $i['stages'])));
        $h .= $this->fact('Sectors', esc_html(implode(', ', $i['sectors'])));
        $h .= $this->fact('Ticket size', $i['ticket_size'] ? esc_html($i['ticket_size']) : '');
        $h .= $this->fact('Location', $i['location'] ? esc_html($i['location']) : '');
        $h .= $this->fact('Founded', $i['founded'] ? esc_html($i['founded']) : '');
        $h .= $this->fact('Website', $this->external_link($i['website'], $host ?: $i['website']));
        $h .= '</dl></section>';
        if ($i['portfolio']) {
            $h .= '<section class="sio-section"><h2>Portfolio</h2><ul class="sio-portfolio">';
            foreach ($i['portfolio'] as $p) {
                $match = $startups[$this->norm($p)] ?? null;
                $h .= '<li>' . ($match ? '<a href="' . esc_url($match['url']) . '">' . esc_html($p) . '</a>' : esc_html($p)) . '</li>';
            }
            $h .= '</ul></section>';
        }
        $h .= '<p class="sio-source">From <a href="' . esc_url($list_url) . '">Investors in Icelandic startups</a> by Startup Iceland, free to reuse under CC BY 4.0. '
            . 'Something wrong or out of date? Write to <a href="mailto:bala@startupiceland.com">bala@startupiceland.com</a>.</p>';

        $org = array('@type' => 'Organization', '@id' => $i['url'] . '#org', 'name' => $i['name'], 'url' => $i['website'] ?: $i['url'],
                     'description' => $i['description'], 'mainEntityOfPage' => $i['url']);
        if ($i['founded']) {
            $org['foundingDate'] = (string) $i['founded'];
        }
        if ($i['location']) {
            $org['location'] = $i['location'];
        }
        $keywords = array_merge(array($i['type']), $i['sectors']);
        $org['keywords'] = implode(', ', array_filter($keywords));
        $h .= $this->json_ld_script(array($org, $this->breadcrumb_ld('Investors in Icelandic startups', $list_url, $i)));
        return $h . '</div>';
    }

    // ---------------------------------------------------------------- sitemap of the profile pages

    public function serve_sitemap($wp) {
        $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
        if ('si-sitemap.xml' !== $path) {
            return;
        }
        $s = $this->startups();
        $i = $this->investors();
        $urls = array(
            array(home_url('/iceland-startup-directory/'), $s['updated']),
            array(home_url('/investors/'), $i['updated']),
            array(home_url(self::NUMBERS_PATH), max((string) $s['updated'], (string) $i['updated'])),
        );
        foreach ($s['rows'] as $r) {
            $urls[] = array($r['url'], $s['updated']);
        }
        foreach ($i['rows'] as $r) {
            $urls[] = array($r['url'], $i['updated']);
        }
        header('Content-Type: application/xml; charset=utf-8');
        header('Cache-Control: public, max-age=3600');
        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            echo '<url><loc>' . esc_url($u[0]) . '</loc>' . ($u[1] ? '<lastmod>' . esc_html($u[1]) . '</lastmod>' : '') . "</url>\n";
        }
        echo "</urlset>\n";
        exit;
    }

    public function robots_txt($output) {
        return rtrim($output) . "\nSitemap: " . home_url('/si-sitemap.xml') . "\n";
    }

    // Tag pages (1,800 tags, most used once), month and year archives, and the paused news page
    // are thin duplicates of the posts themselves; keep them out of search, but let crawlers
    // follow their links to the posts.
    public function robots_meta($robots) {
        if (is_tag() || is_date() || is_page('news')) {
            unset($robots['max-image-preview']);
            $robots['noindex'] = true;
            $robots['follow'] = true;
        }
        return $robots;
    }

    // ---------------------------------------------------------------- ecosystem in numbers

    public function enqueue_styles() {
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'si_ecosystem_numbers')) {
            wp_enqueue_style('si-open-data-css', plugin_dir_url(__FILE__) . 'css/numbers.css', array(), self::VERSION);
        }
    }

    private function count_by($rows, $key) {
        $counts = array();
        foreach ($rows as $r) {
            foreach ((array) ($r[$key] ?? '') as $v) {
                if ('' !== (string) $v) {
                    $counts[$v] = ($counts[$v] ?? 0) + 1;
                }
            }
        }
        arsort($counts);
        return $counts;
    }

    private function table($caption, $head, $counts, $total = null) {
        $html = '<table class="sio-table"><caption>' . esc_html($caption) . '</caption><thead><tr><th scope="col">'
            . esc_html($head) . '</th><th scope="col" class="is-num">Count</th>'
            . ($total ? '<th scope="col" class="is-num">Share</th>' : '') . '</tr></thead><tbody>';
        foreach ($counts as $label => $n) {
            $html .= '<tr><th scope="row">' . esc_html($label) . '</th><td class="is-num">' . esc_html(number_format_i18n($n)) . '</td>'
                . ($total ? '<td class="is-num">' . esc_html(round(100 * $n / $total)) . '%</td>' : '') . '</tr>';
        }
        return $html . '</tbody></table>';
    }

    public function render_numbers($atts) {
        $s = $this->startups();
        $i = $this->investors();
        $j = $this->jobs();
        $startups = $s['rows'];
        $n = count($startups);
        $status = $this->count_by($startups, 'status');
        $decades = array();
        foreach ($startups as $r) {
            if (!empty($r['founded'])) {
                $d = (int) floor((int) $r['founded'] / 10) * 10;
                $decades[$d . 's'] = ($decades[$d . 's'] ?? 0) + 1;
            }
        }
        ksort($decades);
        $recent = count(array_filter($startups, function ($r) {
            return !empty($r['founded']) && (int) $r['founded'] >= (int) gmdate('Y') - 5;
        }));
        $acquisitions = array_values(array_filter($startups, function ($r) {
            return 'acquired' === $r['status'];
        }));
        $api = rest_url(self::NS);

        ob_start();
        ?>
        <div class="sio-numbers" id="sio-numbers">
            <header class="sio-hero">
                <p class="sio-eyebrow">Startup Iceland · Open data</p>
                <h1 class="sio-title">Iceland’s startup ecosystem in numbers</h1>
                <p class="sio-lead">A summary of the Startup Iceland directories: <?php echo esc_html(number_format_i18n($n)); ?> startups,
                    <?php echo esc_html(count($i['rows'])); ?> investors and <?php echo esc_html(count($j['rows'])); ?> open jobs.
                    Every figure is counted from the lists themselves, which you can download below.</p>
                <div class="sio-stats">
                    <div class="sio-stat"><span class="sio-value"><?php echo esc_html(number_format_i18n($n)); ?></span><span class="sio-label">startups listed</span></div>
                    <div class="sio-stat"><span class="sio-value"><?php echo esc_html($status['active'] ?? 0); ?></span><span class="sio-label">active today</span></div>
                    <div class="sio-stat"><span class="sio-value"><?php echo esc_html($status['acquired'] ?? 0); ?></span><span class="sio-label">acquired</span></div>
                    <div class="sio-stat"><span class="sio-value"><?php echo esc_html($recent); ?></span><span class="sio-label">founded in the last five years</span></div>
                </div>
            </header>

            <section class="sio-section">
                <h2>Startups</h2>
                <div class="sio-grid">
                    <?php echo $this->table('Startups by sector', 'Sector', $this->count_by($startups, 'sector'), $n); ?>
                    <?php echo $this->table('Startups by decade founded', 'Founded', $decades); ?>
                </div>
                <?php if ($acquisitions): ?>
                <h3>Acquisitions</h3>
                <table class="sio-table sio-wide"><caption>Icelandic startups that have been acquired</caption>
                    <thead><tr><th scope="col">Company</th><th scope="col">Acquired by</th><th scope="col" class="is-num">Founded</th></tr></thead><tbody>
                    <?php foreach ($acquisitions as $a): ?>
                    <tr><th scope="row"><a href="<?php echo esc_url($a['url']); ?>"><?php echo esc_html($a['name']); ?></a></th><td><?php echo esc_html($a['acquired_by'] ?: '–'); ?></td><td class="is-num"><?php echo esc_html($a['founded'] ?: '–'); ?></td></tr>
                    <?php endforeach; ?>
                </tbody></table>
                <?php endif; ?>
            </section>

            <section class="sio-section">
                <h2>Investors</h2>
                <div class="sio-grid">
                    <?php echo $this->table('Investors by type', 'Type', $this->count_by($i['rows'], 'type'), count($i['rows'])); ?>
                    <?php echo $this->table('Investors by stage they invest in', 'Stage', $this->count_by($i['rows'], 'stages')); ?>
                </div>
            </section>

            <?php if ($j['rows']): ?>
            <section class="sio-section">
                <h2>Open jobs</h2>
                <p>On the <a href="/jobs/">jobs board</a>, data as of <?php echo esc_html($j['updated'] ?: 'the last collection'); ?>:
                    <?php echo esc_html(count($j['rows'])); ?> open jobs, <?php echo esc_html(count(array_filter($j['rows'], function ($r) { return $r['startup']; }))); ?> of them at startups in the directory.</p>
                <div class="sio-grid">
                    <?php echo $this->table('Open jobs by category', 'Category', $this->count_by($j['rows'], 'category'), count($j['rows'])); ?>
                    <?php echo $this->table('Open jobs by workplace', 'Workplace', $this->count_by($j['rows'], 'workplace'), count($j['rows'])); ?>
                </div>
            </section>
            <?php endif; ?>

            <section class="sio-section sio-data">
                <h2>Use the data</h2>
                <p>The startup and investor lists are free to reuse under <a href="<?php echo esc_url(self::LICENSE_URL); ?>">Creative Commons Attribution 4.0 (CC BY 4.0)</a>: please credit <?php echo esc_html(self::ATTRIBUTION); ?>. Job postings belong to their employers and are listed for reference only.</p>
                <ul>
                    <li>Startups: <a href="<?php echo esc_url($api . '/startups'); ?>">JSON</a> · <a href="<?php echo esc_url($api . '/startups?format=csv'); ?>">CSV</a> (updated <?php echo esc_html($s['updated'] ?: '–'); ?>)</li>
                    <li>Investors: <a href="<?php echo esc_url($api . '/investors'); ?>">JSON</a> · <a href="<?php echo esc_url($api . '/investors?format=csv'); ?>">CSV</a> (updated <?php echo esc_html($i['updated'] ?: '–'); ?>)</li>
                    <li>Open jobs: <a href="<?php echo esc_url($api . '/jobs'); ?>">JSON</a> · <a href="<?php echo esc_url($api . '/jobs?format=csv'); ?>">CSV</a> (data as of <?php echo esc_html($j['updated'] ?: '–'); ?>)</li>
                </ul>
                <p>Missing a company or an investor? Write to <a href="mailto:bala@startupiceland.com">bala@startupiceland.com</a>.</p>
            </section>

            <?php echo $this->dataset_json_ld($s, $i, $j); ?>
        </div>
        <?php
        return ob_get_clean();
    }

    // schema.org Dataset: what the data is, its licence and where to download it
    private function dataset_json_ld($s, $i, $j) {
        $api = rest_url(self::NS);
        $dist = function ($name) use ($api) {
            return array(
                array('@type' => 'DataDownload', 'encodingFormat' => 'application/json', 'contentUrl' => $api . '/' . $name),
                array('@type' => 'DataDownload', 'encodingFormat' => 'text/csv', 'contentUrl' => $api . '/' . $name . '?format=csv'),
            );
        };
        $creator = array('@type' => 'Organization', 'name' => 'Startup Iceland', 'url' => home_url('/'));
        $base = array('license' => self::LICENSE_URL, 'creator' => $creator, 'isAccessibleForFree' => true,
                      'spatialCoverage' => array('@type' => 'Place', 'name' => 'Iceland'));
        $graph = array(
            array_merge($base, array('@type' => 'Dataset', 'name' => 'Iceland startup directory',
                'description' => 'Icelandic startups and technology companies with sector, status (active, acquired, exited), acquirer, year founded and website.',
                'url' => home_url('/iceland-startup-directory/'), 'dateModified' => $s['updated'], 'distribution' => $dist('startups'))),
            array_merge($base, array('@type' => 'Dataset', 'name' => 'Investors in Icelandic startups',
                'description' => 'Venture capital firms, angel investors, government funds and accelerators investing in Icelandic startups, with type, stages, sectors, ticket size and portfolio.',
                'url' => home_url('/investors/'), 'dateModified' => $i['updated'], 'distribution' => $dist('investors'))),
            array_merge(array_diff_key($base, array('license' => 1)), array('@type' => 'Dataset', 'name' => 'Open jobs on the Startup Iceland jobs board',
                'description' => 'Open jobs at Icelandic startups and other employers, collected daily, with employer, category, type, workplace, location, posting date and application link.',
                'url' => home_url('/jobs/'), 'dateModified' => $j['updated'], 'distribution' => $dist('jobs'))),
        );
        return '<script type="application/ld+json">'
            . wp_json_encode(array('@context' => 'https://schema.org', '@graph' => $graph),
                             JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP)
            . '</script>';
    }
}

// Initialize the plugin
Startup_Iceland_Open_Data::get_instance();
