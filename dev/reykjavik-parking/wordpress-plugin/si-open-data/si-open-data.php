<?php
/**
 * Plugin Name: Startup Iceland Open Data
 * Plugin URI: https://startupiceland.com
 * Description: Makes the startup, investor and jobs data easy for people and AI tools to find and reuse: /llms.txt, open data endpoints (JSON and CSV, CC BY 4.0) and an "ecosystem in numbers" page.
 * Version: 1.0.0
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

    const VERSION = '1.0.0';
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
        add_action('rest_api_init', array($this, 'register_routes'));
        add_shortcode('si_ecosystem_numbers', array($this, 'render_numbers'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
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
                'name'        => $s['name'],
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
                'name'        => $i['name'],
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
                    return new WP_REST_Response(array(
                        'name'        => $name,
                        'description' => $description,
                        'source'      => home_url('/'),
                        'license'     => self::LICENSE,
                        'license_url' => self::LICENSE_URL,
                        'attribution' => 'Please credit ' . self::ATTRIBUTION,
                        'updated'     => $list['updated'],
                        'count'       => count($list['rows']),
                        'csv'         => rest_url(self::NS . '/' . $name) . '?format=csv',
                        'items'       => $list['rows'],
                    ));
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
            'All lists below are free to reuse under ' . self::LICENSE . ' (' . self::LICENSE_URL . '): please credit ' . self::ATTRIBUTION . '.',
            '',
            '## Directories and jobs',
            '',
            sprintf('- [Iceland startup directory](%s): %d startups (%d active, %d acquired), each with sector, year founded and website. Updated %s.',
                $site . 'iceland-startup-directory/', count($s['rows']), $active, $acquired, $s['updated'] ?: 'regularly'),
            sprintf('- [Investors in Icelandic startups](%s): %d venture capital firms, angels, government funds and accelerators, with stages, ticket sizes and portfolios. Updated %s.',
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
            '',
            '## Optional',
            '',
            sprintf('- [Blog](%s): essays on entrepreneurship and the Icelandic ecosystem.', $site . 'blog/'),
            '- Corrections and additions: bala@startupiceland.com',
            '',
        );
        return implode("\n", $lines);
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
                    <tr><th scope="row"><?php echo esc_html($a['name']); ?></th><td><?php echo esc_html($a['acquired_by'] ?: '–'); ?></td><td class="is-num"><?php echo esc_html($a['founded'] ?: '–'); ?></td></tr>
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
                <p>The lists are free to reuse under <a href="<?php echo esc_url(self::LICENSE_URL); ?>">Creative Commons Attribution 4.0 (CC BY 4.0)</a>: please credit <?php echo esc_html(self::ATTRIBUTION); ?>.</p>
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
            array_merge($base, array('@type' => 'Dataset', 'name' => 'Open jobs on the Startup Iceland jobs board',
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
