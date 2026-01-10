<?php
/**
 * Plugin Name: Reykjavik Parking
 * Plugin URI: https://startupiceland.com
 * Description: Interactive parking map for downtown Reykjavik showing garages, zones, and rates.
 * Version: 1.0.0
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
                '1.0.0'
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
                '1.0.0',
                true
            );

            // Plugin JS
            wp_enqueue_script(
                'reykjavik-parking-js',
                plugin_dir_url(__FILE__) . 'js/parking-map.js',
                array('leaflet-js', 'reykjavik-parking-data'),
                '1.0.0',
                true
            );
        }
    }

    public function render_parking_map($atts) {
        $atts = shortcode_atts(array(
            'height' => '600px',
            'show_stats' => 'true',
            'show_legend' => 'true',
            'show_tips' => 'true'
        ), $atts);

        $show_stats = filter_var($atts['show_stats'], FILTER_VALIDATE_BOOLEAN);
        $show_legend = filter_var($atts['show_legend'], FILTER_VALIDATE_BOOLEAN);
        $show_tips = filter_var($atts['show_tips'], FILTER_VALIDATE_BOOLEAN);

        ob_start();
        ?>
        <div class="rvk-parking-container">
            <div class="rvk-parking-main">
                <div id="rvk-parking-map" style="height: <?php echo esc_attr($atts['height']); ?>"></div>

                <div class="rvk-parking-sidebar">
                    <div class="rvk-info-panel">
                        <h3>Parking Information</h3>
                        <p class="rvk-hint">Click a marker on the map for details</p>

                        <div id="rvk-selected-parking" class="rvk-hidden">
                            <h4 id="rvk-parking-name"></h4>
                            <div class="rvk-detail-row">
                                <span class="rvk-label">Address:</span>
                                <span id="rvk-parking-address"></span>
                            </div>
                            <div class="rvk-detail-row">
                                <span class="rvk-label">Capacity:</span>
                                <span id="rvk-parking-capacity"></span>
                            </div>
                            <div class="rvk-detail-row">
                                <span class="rvk-label">Hours:</span>
                                <span id="rvk-parking-hours"></span>
                            </div>
                            <div class="rvk-detail-row">
                                <span class="rvk-label">Rates:</span>
                                <span id="rvk-parking-rates"></span>
                            </div>
                        </div>
                    </div>

                    <?php if ($show_stats): ?>
                    <div class="rvk-stats-panel">
                        <h3>Downtown Statistics (2026)</h3>
                        <div class="rvk-stat-card">
                            <div class="rvk-stat-number">3,334</div>
                            <div class="rvk-stat-label">Parking Garage Spaces</div>
                        </div>
                        <div class="rvk-stat-card">
                            <div class="rvk-stat-number">1,201</div>
                            <div class="rvk-stat-label">Paid Street Parking</div>
                        </div>
                        <div class="rvk-stat-card">
                            <div class="rvk-stat-number">471</div>
                            <div class="rvk-stat-label">Free Street Parking</div>
                        </div>
                    </div>
                    <?php endif; ?>

                    <?php if ($show_legend): ?>
                    <div class="rvk-legend">
                        <h4>Legend</h4>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-marker rvk-garage"></span>
                            <span>Parking Garage</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-marker rvk-lot"></span>
                            <span>Parking Lot</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-zone rvk-p1"></span>
                            <span>P1 Zone (270 ISK/hr)</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-zone rvk-p2"></span>
                            <span>P2 Zone (185 ISK/hr)</span>
                        </div>
                        <div class="rvk-legend-item">
                            <span class="rvk-legend-zone rvk-p3"></span>
                            <span>P3 Zone (125 ISK/hr)</span>
                        </div>
                    </div>
                    <?php endif; ?>

                    <?php if ($show_tips): ?>
                    <div class="rvk-tips">
                        <h4>Parking Tips</h4>
                        <ul>
                            <li>Free parking after 18:00 on streets</li>
                            <li>Free all day on Sundays (except garages)</li>
                            <li>P1-P3 zones: Mon-Fri 09:00-18:00, Sat 10:00-16:00</li>
                            <li>Download Parka app for mobile payments</li>
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
