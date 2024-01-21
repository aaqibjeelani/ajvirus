<?php
/**
 * Theme functions and definitions
 *
 * @package Aahana
 */

/**
 * After setup theme hook
 */
function aahana_theme_setup(){
    /*
     * Make child theme available for translation.
     * Translations can be filed in the /languages/ directory.
     */
    load_child_theme_textdomain( 'aahana' );	
}
add_action( 'after_setup_theme', 'aahana_theme_setup' );

/**
 * Load assets.
 */

function aahana_theme_css() {
	wp_enqueue_style( 'aahana-parent-theme-style', get_template_directory_uri() . '/style.css' );
	wp_enqueue_style('aahana-child-theme-style', get_stylesheet_directory_uri() . '/style.css');	
}
add_action( 'wp_enqueue_scripts', 'aahana_theme_css', 99);

require get_stylesheet_directory() . '/theme-functions/controls/class-customize.php';

/**
 * Import Options From Parent Theme
 *
 */
function aahana_parent_theme_options() {
	$cosmobit_mods = get_option( 'theme_mods_cosmobit' );
	if ( ! empty( $cosmobit_mods ) ) {
		foreach ( $cosmobit_mods as $cosmobit_mod_k => $cosmobit_mod_v ) {
			set_theme_mod( $cosmobit_mod_k, $cosmobit_mod_v );
		}
	}
}
add_action( 'after_switch_theme', 'aahana_parent_theme_options' );


/**
 * Page header
 *
 */
function aahana_custom_header_setup() {
	add_theme_support( 'custom-header', apply_filters( 'aahana_custom_header_args', array(
		'default-text-color' => 'ffffff',
		'width'              => 1920,
		'height'             => 200,
		'flex-height'        => true,
		'flex-width'         => true,
		'wp-head-callback'   => 'cosmobit_header_style',
	) ) );
}

add_action( 'after_setup_theme', 'aahana_custom_header_setup' );