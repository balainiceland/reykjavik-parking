<?php
/**
 * Plugin Name: Iceland Co-working Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of co-working spaces in Iceland with interactive map
 * Version: 1.1.0
 * Author: Startup Iceland
 * Author URI: https://startupiceland.com
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

class Iceland_Coworking_Directory {

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
        add_shortcode('coworking_directory', array($this, 'render_directory'));
    }

    public function enqueue_assets() {
        global $post;

        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'coworking_directory')) {
            // Leaflet CSS
            wp_enqueue_style(
                'leaflet-css',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                array(),
                '1.9.4'
            );

            // Plugin CSS
            wp_enqueue_style(
                'icd-styles',
                plugin_dir_url(__FILE__) . 'css/coworking-directory.css',
                array('leaflet-css'),
                '1.1.0'
            );

            // Leaflet JS
            wp_enqueue_script(
                'leaflet-js',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
                array(),
                '1.9.4',
                true
            );

            // Data
            wp_enqueue_script(
                'icd-data',
                plugin_dir_url(__FILE__) . 'js/coworking-data.js',
                array(),
                '1.1.0',
                true
            );

            // Main JS
            wp_enqueue_script(
                'icd-main',
                plugin_dir_url(__FILE__) . 'js/coworking-directory.js',
                array('leaflet-js', 'icd-data'),
                '1.1.0',
                true
            );
        }
    }

    public function render_directory($atts) {
        $atts = shortcode_atts(array(
            'show_stats' => 'true',
            'show_cta' => 'true',
            'show_map' => 'true',
            'map_height' => '400px',
            'city' => 'all'
        ), $atts, 'coworking_directory');

        ob_start();
        ?>
        <div id="icd-directory-container" class="icd-directory-container">

            <!-- Controls -->
            <div class="icd-controls">
                <div class="icd-search-row">
                    <div class="icd-search-wrapper">
                        <input type="text" id="icd-search" placeholder="Search co-working spaces, locations...">
                    </div>
                </div>
                <div class="icd-filter-row">
                    <div class="icd-filter-wrapper">
                        <select id="icd-type-filter">
                            <option value="all">All Types</option>
                        </select>
                    </div>
                    <div class="icd-filter-wrapper">
                        <select id="icd-city-filter">
                            <option value="all">All Locations</option>
                        </select>
                    </div>
                    <div class="icd-filter-wrapper">
                        <select id="icd-audience-filter">
                            <option value="all">All Audiences</option>
                        </select>
                    </div>
                </div>
            </div>

            <?php if ($atts['show_stats'] === 'true'): ?>
            <!-- Stats Bar -->
            <div class="icd-stats-bar">
                <div class="icd-stat-item">
                    <span class="icd-stat-number" id="icd-stat-total">0</span>
                    <span class="icd-stat-label">Total Spaces</span>
                </div>
                <div class="icd-stat-item">
                    <span class="icd-stat-number" id="icd-stat-reykjavik">0</span>
                    <span class="icd-stat-label">In Reykjavik</span>
                </div>
                <div class="icd-stat-item">
                    <span class="icd-stat-number" id="icd-stat-innovation">0</span>
                    <span class="icd-stat-label">Innovation Hubs</span>
                </div>
                <div class="icd-stat-item">
                    <span class="icd-stat-number" id="icd-stat-creative">0</span>
                    <span class="icd-stat-label">Creative Spaces</span>
                </div>
                <span class="icd-showing-text">Showing <strong id="icd-showing-count">0</strong> spaces</span>
            </div>
            <?php endif; ?>

            <?php if ($atts['show_map'] === 'true'): ?>
            <!-- Map Section -->
            <div class="icd-map-section">
                <div class="icd-view-toggle">
                    <button id="icd-view-map" class="icd-view-btn active">Map View</button>
                    <button id="icd-view-list" class="icd-view-btn">List View</button>
                </div>
                <div id="icd-map" class="icd-map" style="height: <?php echo esc_attr($atts['map_height']); ?>"></div>
            </div>
            <?php endif; ?>

            <!-- Space Grid -->
            <div id="icd-space-grid" class="icd-space-grid">
                <!-- Cards populated by JavaScript -->
            </div>

            <?php if ($atts['show_cta'] === 'true'): ?>
            <!-- Call to Action -->
            <div class="icd-cta-box">
                <div class="icd-cta-content">
                    <h3>Run a Co-working Space?</h3>
                    <p>If you operate a co-working space in Iceland and aren't listed here, we'd love to include you. Help remote workers and startups find the perfect workspace.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Co-working%20Space%20Submission&body=Space%20Name%3A%20%0AWebsite%3A%20%0AAddress%3A%20%0ACity%3A%20%0AType%3A%20(Co-working%2FInnovation%20Hub%2FCreative%20Community%2Fetc.)%0AAmenities%3A%20%0APricing%3A%20%0ATarget%20Audience%3A%20%0ABrief%20Description%3A%20" class="icd-cta-button">Submit Your Space</a>
                    <p class="icd-cta-note">You'll also be added to the Startup Iceland community updates.</p>
                </div>
            </div>
            <?php endif; ?>

        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Iceland_Coworking_Directory::get_instance();
