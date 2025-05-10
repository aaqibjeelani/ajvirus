<?php
/**
 * Singleton class for handling the theme's customizer integration.
 */
final class Aahana_Customize {

	/**
	 * Returns the instance.
	 */
	public static function get_instance() {

		static $instance = null;

		if ( is_null( $instance ) ) {
			$instance = new self;
			$instance->setup_actions();
		}

		return $instance;
	}

	/**
	 * Constructor method.
	 */
	private function __construct() {}

	/**
	 * Sets up initial actions.
	 */
	private function setup_actions() {

		// Register panels, sections, settings, controls, and partials.
		add_action( 'customize_register', array( $this, 'sections' ),999 );
	}

	/**
	 * Sets up the customizer sections.
	 */
	public function sections( $manager ) {

		// Load custom sections.
         require_once COSMOBIT_THEME_INC_DIR . '/customizer/controls/code/upgrade/section-pro.php';

        // Register custom section types.
		$manager->register_section_type( 'Cosmobit_Customize_Section_Pro' );

		// Register sections.
		$manager->add_section(
			new Cosmobit_Customize_Section_Pro(
				$manager,
				'cosmobit',
				array(
                    'pro_text' => esc_html__( 'Upgrade to Aahana Pro','aahana' ),
                    'pro_url'  => 'https://desertthemes.com/themes/aahana-pro/',
                    'priority' => 0
                )
			)
		);
	}
}
// Doing this customizer thang!
Aahana_Customize::get_instance();