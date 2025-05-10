<?php
/**
* Search
* @since Alexia 1.0
*/
function alexia_custom_header_setup()
{
    $header_image = esc_url(get_template_directory_uri() . '/assets/images/page-header.jpg');
    add_theme_support('custom-header', apply_filters('flixita_custom_header_args', array(
        'default-image' => $header_image,
        'default-text-color' => 'fff',
        'width' => 2000,
        'height' => 200,
        'flex-height' => true,
        'wp-head-callback' => 'flixita_header_style',
    )));
}
add_action('after_setup_theme', 'alexia_custom_header_setup');

require get_stylesheet_directory() . '/core/customizer/custom-controls/customize-upgrade-control.php';