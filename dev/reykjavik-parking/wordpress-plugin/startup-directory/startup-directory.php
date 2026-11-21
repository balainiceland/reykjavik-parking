<?php
/**
 * Plugin Name: Startup Iceland Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of Icelandic startups with filtering by sector and status.
 * Version: 1.3.0
 * Author: Startup Iceland
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Startup_Iceland_Directory {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('startup_directory', array($this, 'render_directory'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function enqueue_scripts() {
        global $post;

        // Only load on pages with our shortcode
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'startup_directory')) {
            // Plugin CSS
            wp_enqueue_style(
                'startup-directory-css',
                plugin_dir_url(__FILE__) . 'css/directory.css',
                array(),
                '1.3.0'
            );

            // Startup data
            wp_enqueue_script(
                'startup-directory-data',
                plugin_dir_url(__FILE__) . 'js/startups-data.js',
                array(),
                '1.3.0',
                true
            );

            // Plugin JS
            wp_enqueue_script(
                'startup-directory-js',
                plugin_dir_url(__FILE__) . 'js/directory.js',
                array('startup-directory-data'),
                '1.3.0',
                true
            );
        }
    }

    /**
     * The same JSON file the browser loads, read once per request. The directory is printed
     * from it on the server so that search engines and AI crawlers, which mostly do not run
     * JavaScript, see every startup; directory.js then takes over for filtering and sorting.
     */
    private function load_data() {
        static $data = null;
        if (null === $data) {
            $data = array();
            $path = plugin_dir_path(__FILE__) . 'js/startups-data.json';
            if (is_readable($path)) {
                $decoded = json_decode(file_get_contents($path), true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }
        }
        return $data;
    }

    private function sector_names($data) {
        $names = array();
        foreach ((array) ($data['sectors'] ?? array()) as $sector) {
            if (isset($sector['id'], $sector['name'])) {
                $names[$sector['id']] = $sector['name'];
            }
        }
        return $names;
    }

    private function sorted_startups($data) {
        $startups = array_values(array_filter((array) ($data['startups'] ?? array()), function ($s) {
            return is_array($s) && !empty($s['name']);
        }));
        usort($startups, function ($a, $b) {
            return strcasecmp(remove_accents($a['name']), remove_accents($b['name']));
        });
        return $startups;
    }

    private function is_web_url($url) {
        return is_string($url) && preg_match('#^https?://#i', $url);
    }

    // Same markup as createStartupCard() in js/directory.js
    private function card_html($startup, $sector_names) {
        $status = !empty($startup['status']) ? $startup['status'] : 'active';
        $sector = !empty($startup['sector']) ? $startup['sector'] : 'other';
        $sector_name = $sector_names[$sector] ?? $sector;
        $html  = '<article class="sid-startup-card">';
        $html .= '<div class="sid-card-top"><h3 class="sid-startup-name">' . esc_html($startup['name']) . '</h3>';
        $html .= '<span class="sid-status-badge sid-status-' . esc_attr($status) . '">' . esc_html(ucfirst($status)) . '</span></div>';
        if ('acquired' === $status && !empty($startup['acquiredBy'])) {
            $html .= '<p class="sid-acquired-by">Acquired by <strong>' . esc_html($startup['acquiredBy']) . '</strong></p>';
        }
        $html .= '<p class="sid-description">' . esc_html(!empty($startup['description']) ? $startup['description'] : 'No description available') . '</p>';
        $html .= '<div class="sid-card-footer"><div class="sid-card-tags">';
        $html .= '<span class="sid-tag sid-sector-tag sid-tag-' . esc_attr($sector) . '">' . esc_html($sector_name) . '</span>';
        if (!empty($startup['foundedYear'])) {
            $html .= '<span class="sid-tag is-outline sid-founded">Founded ' . esc_html($startup['foundedYear']) . '</span>';
        }
        $html .= '</div>';
        if ($this->is_web_url($startup['website'] ?? '')) {
            $html .= '<a href="' . esc_url($startup['website']) . '" target="_blank" rel="noopener" class="sid-website-link"'
                . ' aria-label="' . esc_attr('Visit the ' . $startup['name'] . ' website (opens in a new tab)') . '">Visit website '
                . '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a>';
        }
        $html .= '</div></article>';
        return $html;
    }

    // schema.org ItemList of Organizations: the directory as machine-readable facts
    private function json_ld($startups, $sector_names, $updated) {
        $items = array();
        foreach ($startups as $i => $s) {
            $org = array('@type' => 'Organization', 'name' => $s['name']);
            if ($this->is_web_url($s['website'] ?? '')) {
                $org['url'] = $s['website'];
            }
            if (!empty($s['description'])) {
                $org['description'] = $s['description'];
            }
            if (!empty($s['foundedYear'])) {
                $org['foundingDate'] = (string) $s['foundedYear'];
            }
            if (!empty($s['sector'])) {
                $org['keywords'] = $sector_names[$s['sector']] ?? $s['sector'];
            }
            if ('acquired' === ($s['status'] ?? '') && !empty($s['acquiredBy'])) {
                $org['parentOrganization'] = array('@type' => 'Organization', 'name' => $s['acquiredBy']);
            }
            $items[] = array('@type' => 'ListItem', 'position' => $i + 1, 'item' => $org);
        }
        $list = array(
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => 'Iceland startup directory',
            'description' => 'Icelandic startups and technology companies: active, acquired and exited.',
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
            'show_stats' => 'true'
        ), $atts);

        $show_stats = filter_var($atts['show_stats'], FILTER_VALIDATE_BOOLEAN);

        $data = $this->load_data();
        $sector_names = $this->sector_names($data);
        $startups = $this->sorted_startups($data);
        $count_status = function ($status) use ($startups) {
            return count(array_filter($startups, function ($s) use ($status) {
                return ($s['status'] ?? 'active') === $status;
            }));
        };
        $total = count($startups);
        $stat = function ($n) use ($total) {
            return $total ? number_format_i18n($n) : '–';
        };
        $updated = !empty($data['lastUpdated']) ? strtotime($data['lastUpdated']) : false;
        $data_url = plugin_dir_url(__FILE__) . 'js/startups-data.json';

        ob_start();
        ?>
        <div class="sid-directory-container" id="sid-directory-container">
            <!-- Hero: counts are printed from the data; JS refreshes them -->
            <header class="sid-hero">
                <p class="sid-hero-eyebrow">Startup Iceland · Directory</p>
                <h1 class="sid-hero-title">Iceland’s startup directory</h1>
                <p class="sid-hero-lead">Iceland has produced a remarkable number of technology companies for a nation of about 400,000, from CCP Games to Meniga. This directory covers them all, from early-stage ventures to established companies and those that have been acquired.</p>
                <?php if ($show_stats): ?>
                <div class="sid-hero-stats">
                    <div class="sid-hero-stat"><span class="sid-hero-value" id="sid-stat-total"><?php echo esc_html($stat($total)); ?></span><span class="sid-hero-label">startups listed</span></div>
                    <div class="sid-hero-stat"><span class="sid-hero-value" id="sid-stat-active"><?php echo esc_html($stat($count_status('active'))); ?></span><span class="sid-hero-label">active today</span></div>
                    <div class="sid-hero-stat"><span class="sid-hero-value is-accent" id="sid-stat-acquired"><?php echo esc_html($stat($count_status('acquired'))); ?></span><span class="sid-hero-label">acquired</span></div>
                </div>
                <?php endif; ?>
                <a class="sid-hero-link" href="/jobs/">Find jobs at Icelandic startups
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </header>

            <!-- Search and filters -->
            <section class="sid-controls" aria-label="Search and filter startups">
                <label class="sid-search-wrapper" for="sid-search">
                    <span class="sid-search-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
                    <span class="screen-reader-text">Search startups</span>
                    <input type="search" id="sid-search" placeholder="Search by name or keyword" />
                </label>
                <div class="sid-filter-row">
                    <label class="sid-filter-wrapper" for="sid-sector-filter">Sector
                        <select id="sid-sector-filter">
                            <option value="all">All sectors</option>
                            <?php foreach ($sector_names as $id => $name): if ('all' === $id) continue; ?>
                            <option value="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </label>
                    <label class="sid-filter-wrapper" for="sid-status-filter">Status
                        <select id="sid-status-filter">
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="acquired">Acquired</option>
                            <option value="exited">Exited</option>
                        </select>
                    </label>
                </div>
            </section>

            <!-- Count bar and sort -->
            <div class="sid-count-bar">
                <span>Showing <strong id="sid-showing-count"><?php echo esc_html($total); ?></strong> startups</span>
                <label class="sid-sort-wrapper" for="sid-sort">Sort
                    <select id="sid-sort">
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                        <option value="year-desc">Newest first</option>
                        <option value="year-asc">Oldest first</option>
                    </select>
                </label>
            </div>

            <!-- Startup Grid -->
            <div class="sid-startup-grid" id="sid-startup-grid">
                <?php foreach ($startups as $startup) { echo $this->card_html($startup, $sector_names); } ?>
            </div>

            <p class="sid-data-note">
                <?php if ($updated): ?>Last updated <?php echo esc_html(gmdate('j F Y', $updated)); ?>. <?php endif; ?>
                Compiled by Startup Iceland from company websites, investor portfolios and accelerator cohorts.
                <a href="<?php echo esc_url($data_url); ?>">Download the data (JSON)</a>
            </p>

            <?php echo $this->json_ld($startups, $sector_names, $updated); ?>

            <!-- Call to Action -->
            <div class="sid-cta-box">
                <div class="sid-cta-content">
                    <h3>Know a startup that's missing?</h3>
                    <p>If you're a founder or investor and know of an Icelandic startup that should be on this list, we'd love to hear from you. Send us a note and we'll add them to the directory.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Startup%20Directory%20Submission&body=Hi%20Bala%2C%0A%0AI'd%20like%20to%20suggest%20a%20startup%20for%20the%20directory%3A%0A%0AStartup%20Name%3A%20%0AWebsite%3A%20%0ADescription%3A%20%0AFounded%20Year%3A%20%0ASector%3A%20%0A%0AThanks!" class="sid-cta-button">Submit a Startup</a>
                    <p class="sid-cta-note">By submitting, you'll also be added to the Startup Iceland mailing list for ecosystem updates.</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Startup_Iceland_Directory::get_instance();
