<?php
/**
 * Plugin Name: Iceland Investor Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of Icelandic investors, VCs, angels, and funding sources
 * Version: 1.4.0
 * Author: Startup Iceland
 * Author URI: https://startupiceland.com
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

class Iceland_Investor_Directory {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'register_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    public function register_shortcode() {
        add_shortcode('investor_directory', array($this, 'render_directory'));
    }

    public function enqueue_assets() {
        global $post;

        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'investor_directory')) {
            wp_enqueue_style(
                'iid-styles',
                plugin_dir_url(__FILE__) . 'css/investor-directory.css',
                array(),
                '1.4.0'
            );

            wp_enqueue_script(
                'iid-data',
                plugin_dir_url(__FILE__) . 'js/investors-data.js',
                array(),
                '1.4.0',
                true
            );

            wp_enqueue_script(
                'iid-main',
                plugin_dir_url(__FILE__) . 'js/investor-directory.js',
                array('iid-data'),
                '1.4.0',
                true
            );
        }
    }

    /**
     * The same JSON file the browser loads, read once per request. The directory is printed
     * from it on the server so that search engines and AI crawlers, which mostly do not run
     * JavaScript, see every investor; investor-directory.js then takes over for filtering.
     */
    private function load_data() {
        static $data = null;
        if (null === $data) {
            $data = array();
            $path = plugin_dir_path(__FILE__) . 'js/investors-data.json';
            if (is_readable($path)) {
                $decoded = json_decode(file_get_contents($path), true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }
        }
        return $data;
    }

    private function names($list) {
        $names = array();
        foreach ((array) $list as $item) {
            if (isset($item['id'], $item['name']) && 'all' !== $item['id']) {
                $names[$item['id']] = $item['name'];
            }
        }
        return $names;
    }

    // The investor's own page, served by the Startup Iceland Open Data plugin
    private function profile_url($inv) {
        $slug = sanitize_title($inv['name']);
        return home_url('/investor/' . (int) ($inv['id'] ?? 0) . ($slug ? '-' . $slug : '') . '/');
    }

    private function is_web_url($url) {
        return is_string($url) && preg_match('#^https?://#i', $url);
    }

    private function detail_html($label, $value) {
        if (null === $value || '' === $value) {
            return '';
        }
        return '<div class="iid-detail"><dt class="iid-label">' . esc_html($label) . '</dt><dd class="iid-value">' . esc_html($value) . '</dd></div>';
    }

    // Same markup as createInvestorCard() in js/investor-directory.js
    private function card_html($inv, $types, $stages, $sectors) {
        $type = $inv['type'] ?? '';
        $html  = '<article class="iid-investor-card"><div class="iid-card-top">';
        $html .= '<h3 class="iid-investor-name"><a href="' . esc_url($this->profile_url($inv)) . '" data-id="' . (int) ($inv['id'] ?? 0) . '">' . esc_html($inv['name']) . '</a></h3>';
        $html .= '<span class="iid-type-badge iid-type-' . esc_attr($type) . '">' . esc_html($types[$type] ?? $type) . '</span></div>';
        if (!empty($inv['focus'])) {
            $focus = array_map(function ($f) use ($sectors) {
                return esc_html($sectors[$f] ?? $f);
            }, (array) $inv['focus']);
            $html .= '<p class="iid-focus-areas">' . implode('<span class="iid-dot" aria-hidden="true"> · </span>', $focus) . '</p>';
        }
        $html .= '<p class="iid-description">' . esc_html($inv['description'] ?? '') . '</p>';
        if (!empty($inv['stages'])) {
            $html .= '<div class="iid-stages" aria-label="Stages">';
            foreach ((array) $inv['stages'] as $stage) {
                $html .= '<span class="iid-tag iid-stage-tag">' . esc_html($stages[$stage] ?? $stage) . '</span>';
            }
            $html .= '</div>';
        }
        $html .= '<dl class="iid-details">'
            . $this->detail_html('Ticket size', $inv['ticketSize'] ?? null)
            . $this->detail_html('Location', $inv['location'] ?? null)
            . $this->detail_html('Founded', $inv['foundedYear'] ?? null)
            . '</dl>';
        if (!empty($inv['portfolio'])) {
            $portfolio = (array) $inv['portfolio'];
            $shown = esc_html(implode(', ', array_slice($portfolio, 0, 4)));
            if (count($portfolio) > 4) {
                $shown .= ' +' . (count($portfolio) - 4) . ' more';
            }
            $html .= '<p class="iid-portfolio"><strong>Portfolio</strong> ' . $shown . '</p>';
        }
        if ($this->is_web_url($inv['website'] ?? '')) {
            $html .= '<div class="iid-card-footer"><a href="' . esc_url($inv['website']) . '" target="_blank" rel="noopener" class="iid-website-link"'
                . ' aria-label="' . esc_attr('Visit the ' . $inv['name'] . ' website (opens in a new tab)') . '">Visit website '
                . '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a></div>';
        }
        return $html . '</article>';
    }

    // schema.org ItemList of Organizations, including each investor's full portfolio
    private function json_ld($investors, $types, $sectors, $updated) {
        $items = array();
        foreach ($investors as $i => $inv) {
            $org = array('@type' => 'Organization', 'name' => $inv['name']);
            if ($this->is_web_url($inv['website'] ?? '')) {
                $org['url'] = $inv['website'];
            }
            if (!empty($inv['description'])) {
                $org['description'] = $inv['description'];
            }
            if (!empty($inv['foundedYear'])) {
                $org['foundingDate'] = (string) $inv['foundedYear'];
            }
            if (!empty($inv['location'])) {
                $org['location'] = $inv['location'];
            }
            $keywords = array();
            if (!empty($inv['type'])) {
                $keywords[] = $types[$inv['type']] ?? $inv['type'];
            }
            foreach ((array) ($inv['focus'] ?? array()) as $f) {
                $keywords[] = $sectors[$f] ?? $f;
            }
            if ($keywords) {
                $org['keywords'] = implode(', ', $keywords);
            }
            // schema.org has no "invested in" property, so the portfolio goes in as a named text block
            if (!empty($inv['portfolio'])) {
                $org['subjectOf'] = array(
                    '@type' => 'CreativeWork',
                    'name' => 'Portfolio companies',
                    'text' => implode(', ', (array) $inv['portfolio']),
                );
            }
            $items[] = array('@type' => 'ListItem', 'position' => $i + 1, 'item' => $org);
        }
        $list = array(
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => 'Investors in Icelandic startups',
            'description' => 'Venture capital firms, angel investors, government funds and accelerators investing in Icelandic startups.',
            'url' => get_permalink(),
            'numberOfItems' => count($items),
            'itemListElement' => $items,
        );
        if ($updated) {
            $list['dateModified'] = gmdate('Y-m-d', $updated);
        }
        return '<script type="application/ld+json">'
            . wp_json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP)
            . '</script>';
    }

    public function render_directory($atts) {
        $atts = shortcode_atts(array(
            'show_stats' => 'true',
            'show_cta' => 'true',
            'type' => 'all'
        ), $atts, 'investor_directory');

        $data = $this->load_data();
        $types = $this->names($data['types'] ?? array());
        $stages = $this->names($data['stages'] ?? array());
        $sectors = $this->names($data['sectors'] ?? array());
        $investors = array_values(array_filter((array) ($data['investors'] ?? array()), function ($i) {
            return is_array($i) && !empty($i['name']);
        }));
        usort($investors, function ($a, $b) {
            return strcasecmp(remove_accents($a['name']), remove_accents($b['name']));
        });
        $count_type = function ($type) use ($investors) {
            return count(array_filter($investors, function ($i) use ($type) {
                return ($i['type'] ?? '') === $type;
            }));
        };
        $total = count($investors);
        $stat = function ($n) use ($total) {
            return $total ? number_format_i18n($n) : '–';
        };
        $updated = !empty($data['lastUpdated']) ? strtotime($data['lastUpdated']) : false;
        $data_url = plugin_dir_url(__FILE__) . 'js/investors-data.json';

        ob_start();
        ?>
        <div id="iid-directory-container" class="iid-directory-container">
            <!-- Hero: counts are printed from the data; JS refreshes them -->
            <header class="iid-hero">
                <p class="iid-hero-eyebrow">Startup Iceland · Investors</p>
                <h1 class="iid-hero-title">Investors in Icelandic startups</h1>
                <p class="iid-hero-lead">Iceland’s startup ecosystem is backed by a growing network of venture capital firms, angel investors, government funds and accelerators. Use this directory to find the right funding partner for your stage and sector.</p>
                <?php if ($atts['show_stats'] === 'true'): ?>
                <div class="iid-hero-stats">
                    <div class="iid-hero-stat"><span class="iid-hero-value" id="iid-stat-total"><?php echo esc_html($stat($total)); ?></span><span class="iid-hero-label">investors listed</span></div>
                    <div class="iid-hero-stat"><span class="iid-hero-value" id="iid-stat-vc"><?php echo esc_html($stat($count_type('vc'))); ?></span><span class="iid-hero-label">venture capital firms</span></div>
                    <div class="iid-hero-stat"><span class="iid-hero-value" id="iid-stat-angel"><?php echo esc_html($stat($count_type('angel'))); ?></span><span class="iid-hero-label">angel investors</span></div>
                    <div class="iid-hero-stat"><span class="iid-hero-value is-accent" id="iid-stat-government"><?php echo esc_html($stat($count_type('government') + $count_type('accelerator'))); ?></span><span class="iid-hero-label">funds and accelerators</span></div>
                </div>
                <?php endif; ?>
                <a class="iid-hero-link" href="/iceland-startup-directory/">Browse Iceland’s startups
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </header>

            <!-- Search and filters -->
            <section class="iid-controls" aria-label="Search and filter investors">
                <label class="iid-search-wrapper" for="iid-search">
                    <span class="iid-search-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
                    <span class="screen-reader-text">Search investors</span>
                    <input type="search" id="iid-search" placeholder="Search investors or portfolios" />
                </label>
                <div class="iid-filter-row">
                    <label class="iid-filter-wrapper" for="iid-type-filter">Type
                        <select id="iid-type-filter">
                            <option value="all">All types</option>
                            <?php foreach ($types as $id => $name): ?><option value="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></option><?php endforeach; ?>
                        </select>
                    </label>
                    <label class="iid-filter-wrapper" for="iid-stage-filter">Stage
                        <select id="iid-stage-filter">
                            <option value="all">All stages</option>
                            <?php foreach ($stages as $id => $name): ?><option value="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></option><?php endforeach; ?>
                        </select>
                    </label>
                    <label class="iid-filter-wrapper" for="iid-sector-filter">Sector
                        <select id="iid-sector-filter">
                            <option value="all">All sectors</option>
                            <?php foreach ($sectors as $id => $name): ?><option value="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></option><?php endforeach; ?>
                        </select>
                    </label>
                </div>
            </section>

            <!-- Count bar and sort -->
            <div class="iid-count-bar">
                <span>Showing <strong id="iid-showing-count"><?php echo esc_html($total); ?></strong> investors</span>
                <label class="iid-sort-wrapper" for="iid-sort">Sort
                    <select id="iid-sort">
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                        <option value="year-desc">Newest first</option>
                        <option value="year-asc">Oldest first</option>
                    </select>
                </label>
            </div>

            <!-- Investor Grid -->
            <div id="iid-investor-grid" class="iid-investor-grid">
                <?php foreach ($investors as $investor) { echo $this->card_html($investor, $types, $stages, $sectors); } ?>
            </div>

            <p class="iid-data-note">
                <?php if ($updated): ?>Last updated <?php echo esc_html(gmdate('j F Y', $updated)); ?>. <?php endif; ?>
                Compiled by Startup Iceland from investor websites and public portfolio announcements.
                <a href="<?php echo esc_url($data_url); ?>">Download the data (JSON)</a>
            </p>

            <?php echo $this->json_ld($investors, $types, $sectors, $updated); ?>

            <?php if ($atts['show_cta'] === 'true'): ?>
            <!-- Call to Action -->
            <div class="iid-cta-box">
                <div class="iid-cta-content">
                    <h3>Are You an Investor?</h3>
                    <p>If you're an active investor in Icelandic startups and not listed here, we'd love to include you. Help founders find the right funding partners.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Investor%20Directory%20Submission&body=Investor%2FFund%20Name%3A%20%0AWebsite%3A%20%0AType%3A%20(VC%2FAngel%2FAccelerator%2FOther)%0AStages%3A%20(Pre-seed%2FSeed%2FSeries%20A%2Fetc.)%0AFocus%20Areas%3A%20%0ATypical%20Ticket%20Size%3A%20%0APortfolio%20Companies%3A%20%0ABrief%20Description%3A%20" class="iid-cta-button">Submit Your Profile</a>
                    <p class="iid-cta-note">You'll also be added to the Startup Iceland community updates.</p>
                </div>
            </div>
            <?php endif; ?>

        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Iceland_Investor_Directory::get_instance();
