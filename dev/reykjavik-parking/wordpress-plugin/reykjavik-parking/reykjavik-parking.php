<?php
/**
 * Plugin Name: Reykjavik Parking
 * Plugin URI: https://startupiceland.com
 * Description: Interactive parking map for downtown Reykjavik showing garages, zones, and rates.
 * Version: 1.2.0
 * Author: Startup Iceland
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Reykjavik_Parking {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('reykjavik_parking', array($this, 'render_parking_map'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_head', array($this, 'add_pwa_meta'));
        add_action('wp_footer', array($this, 'register_service_worker'));
    }

    public function add_pwa_meta() {
        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'reykjavik_parking')) {
            return;
        }
        ?>
        <link rel="manifest" href="<?php echo plugin_dir_url(__FILE__); ?>manifest.json">
        <meta name="theme-color" content="#32373c">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="RVK Parking">
        <link rel="apple-touch-icon" href="<?php echo plugin_dir_url(__FILE__); ?>icons/icon.svg">
        <?php
    }

    public function register_service_worker() {
        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'reykjavik_parking')) {
            return;
        }
        ?>
        <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('<?php echo plugin_dir_url(__FILE__); ?>sw.js')
                    .then(function(registration) {
                        console.log('RVK Parking SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                        console.log('RVK Parking SW registration failed:', error);
                    });
            });
        }
        </script>
        <?php
    }

    public function enqueue_scripts() {
        global $post;

        // Only load on pages with our shortcode
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'reykjavik_parking')) {
            // Leaflet CSS
            wp_enqueue_style(
                'leaflet-css',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                array(),
                '1.9.4'
            );

            // Plugin CSS
            wp_enqueue_style(
                'reykjavik-parking-css',
                plugin_dir_url(__FILE__) . 'css/parking-map.css',
                array('leaflet-css'),
                '1.2.0'
            );

            // Leaflet JS
            wp_enqueue_script(
                'leaflet-js',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
                array(),
                '1.9.4',
                true
            );

            // Parking data
            wp_enqueue_script(
                'reykjavik-parking-data',
                plugin_dir_url(__FILE__) . 'js/parking-data.js',
                array(),
                '1.2.0',
                true
            );

            // Plugin JS
            wp_enqueue_script(
                'reykjavik-parking-js',
                plugin_dir_url(__FILE__) . 'js/parking-map.js',
                array('leaflet-js', 'reykjavik-parking-data'),
                '1.2.0',
                true
            );
        }
    }

    public function render_parking_map($atts) {
        $atts = shortcode_atts(array(
            'height' => '600px',
            'show_stats' => 'true',
            'show_legend' => 'true',
            'show_tips' => 'true',
            'show_calculator' => 'true'
        ), $atts);

        $show_stats = filter_var($atts['show_stats'], FILTER_VALIDATE_BOOLEAN);
        $show_legend = filter_var($atts['show_legend'], FILTER_VALIDATE_BOOLEAN);
        $show_tips = filter_var($atts['show_tips'], FILTER_VALIDATE_BOOLEAN);
        $show_calculator = filter_var($atts['show_calculator'], FILTER_VALIDATE_BOOLEAN);

        ob_start();
        ?>
        <div class="rvk-parking-container">
            <!-- Language Toggle & Free Indicator -->
            <div class="rvk-top-bar">
                <div id="rvk-free-indicator" class="rvk-free-indicator">
                    <span class="rvk-indicator-icon">...</span> Loading...
                </div>
                <button id="rvk-lang-toggle" class="rvk-lang-toggle" title="Switch language">IS</button>
            </div>

            <div class="rvk-parking-main">
                <div id="rvk-parking-map" style="height: <?php echo esc_attr($atts['height']); ?>"></div>

                <div class="rvk-parking-sidebar">
                    <div class="rvk-info-panel">
                        <h3 id="rvk-title">Parking Information</h3>
                        <p class="rvk-hint" id="rvk-hint-text">Click a marker on the map for details</p>

                        <div id="rvk-selected-parking" class="rvk-hidden">
                            <h4 id="rvk-parking-name"></h4>
                            <div class="rvk-detail-row">
                                <span class="rvk-label" id="rvk-label-address">Address:</span>
                                <span id="rvk-parking-address"></span>
                            </div>
                            <div class="rvk-detail-row">
                                <span class="rvk-label" id="rvk-label-capacity">Capacity:</span>
                                <span id="rvk-parking-capacity"></span>
                            </div>
                            <div class="rvk-detail-row">
                                <span class="rvk-label" id="rvk-label-hours">Hours:</span>
                                <span id="rvk-parking-hours"></span>
                            </div>
                            <div class="rvk-detail-row">
                                <span class="rvk-label" id="rvk-label-rates">Rates:</span>
                                <span id="rvk-parking-rates"></span>
                            </div>
                            <div id="rvk-ev-info" class="rvk-ev-info" style="display: none;"></div>
                            <a id="rvk-directions-link" href="#" target="_blank" class="rvk-directions-link">Get Directions →</a>
                        </div>
                    </div>

                    <?php if ($show_calculator): ?>
                    <div class="rvk-calculator">
                        <h4 id="rvk-calc-title">Price Calculator</h4>
                        <div class="rvk-calc-row">
                            <label id="rvk-calc-duration-label" for="rvk-calc-hours">Duration (hours)</label>
                            <input type="number" id="rvk-calc-hours" min="0.5" step="0.5" value="1" />
                        </div>
                        <button id="rvk-calc-button" class="rvk-calc-button">Calculate</button>
                        <div id="rvk-calc-result" class="rvk-calc-result"></div>
                    </div>
                    <?php endif; ?>

                    <?php if ($show_stats): ?>
                    <div class="rvk-stats-panel">
                        <h3 id="rvk-stats-title">Downtown Statistics (2026)</h3>
                        <div class="rvk-stat-card">
                            <div class="rvk-stat-number">3,334</div>
                            <div class="rvk-stat-label" id="rvk-stat-garage-label">Parking Garage Spaces</div>
                        </div>
                        <div class="rvk-stat-card">
                            <div class="rvk-stat-number">1,201</div>
                            <div class="rvk-stat-label" id="rvk-stat-paid-label">Paid Street Parking</div>
                        </div>
                        <div class="rvk-stat-card">
                            <div class="rvk-stat-number">471</div>
                            <div class="rvk-stat-label" id="rvk-stat-free-label">Free Street Parking</div>
                        </div>
                    </div>
                    <?php endif; ?>

                    <?php if ($show_legend): ?>
                    <div class="rvk-legend">
                        <h4 id="rvk-legend-title">Legend</h4>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-marker rvk-garage"></span>
                            <span id="rvk-legend-garage">Parking Garage</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-marker rvk-mall-marker"></span>
                            <span id="rvk-legend-mall">Shopping Mall</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-marker rvk-garage rvk-has-ev"></span>
                            <span id="rvk-legend-ev">EV Charging</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-zone rvk-p1"></span>
                            <span id="rvk-legend-p1">P1 - Central (270 ISK/hr)</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-zone rvk-p2"></span>
                            <span id="rvk-legend-p2">P2 - Inner Ring (185 ISK/hr)</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-zone rvk-p3"></span>
                            <span id="rvk-legend-p3">P3 - Outer Ring (125 ISK/hr)</span>
                        </div>
                    </div>
                    <?php endif; ?>

                    <?php if ($show_tips): ?>
                    <div class="rvk-tips">
                        <h4 id="rvk-tips-title">Parking Tips</h4>
                        <ul>
                            <li id="rvk-tip1">Free parking after 18:00 on streets</li>
                            <li id="rvk-tip2">Free all day on Sundays (except garages)</li>
                            <li id="rvk-tip3">P1-P3 zones: Mon-Fri 09:00-18:00, Sat 10:00-16:00</li>
                            <li id="rvk-tip4">Download Parka app for mobile payments</li>
                        </ul>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Reykjavik_Parking::get_instance();
