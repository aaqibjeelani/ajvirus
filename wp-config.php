<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'ajvirus_db' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'hwn,L2I{A0P~Ai;jw(UrW>~BH(K%~&]_Bf(rgl9=GN>Vb?nf}FYTVA_srf~-22#Q' );
define( 'SECURE_AUTH_KEY',  'p@d2B<jPJ^-Y+gXFz6dWD3O|GVuPvhEA`Wz4yQn~C5+mas-Wv-+PW-+zjiJdCEsv' );
define( 'LOGGED_IN_KEY',    'Io;O_Jl%9?@DUJ0>_5c,$4it46rbP7j|}:R`[uj.W966J~nVD8#h$TwfI%jET>X?' );
define( 'NONCE_KEY',        '76~1y91e=2-FDH/20S&1BvdkwtV`_}BX+2#U<??t<cfDcjLt_ce%$Pa^% eI%ZNg' );
define( 'AUTH_SALT',        'TTrxTY~jQQ/8=QLQJFFuHZ2]Nycbtc%e-;2=+]ZkVSJWWLr2%eR=|Pm(Mh,D&4.j' );
define( 'SECURE_AUTH_SALT', 'i/{y-_y)s<?;vJh?PTLdC)1c8hkDYE>|e@~JKbBU{RjrnB^sKa%W!{g3rI>Z&rq)' );
define( 'LOGGED_IN_SALT',   'q9sRTb-%[FjH#oY{w0BeFk#P`.:V=O8Fz27$8XVyr{(6lP,*Rc-|.!uIL8#/jR,L' );
define( 'NONCE_SALT',       'Y6lQ$02ua#4??>rr!OPgeZI8(l~eDXy$x!{aL#:~=8v.PD80krQ/!Vw)5!usk#TW' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
