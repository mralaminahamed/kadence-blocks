<?php
/**
 * Class responsible for sending events AI Events to Stellar Prophecy WP AI.
 */

use KadenceWP\KadenceBlocks\StellarWP\Uplink\Config as UplinkConfig;
use KadenceWP\KadenceBlocks\StellarWP\Uplink\Site\Data;
use KadenceWP\KadenceBlocks\StellarWP\Uplink\Auth\Token\Contracts\Token_Manager;
use function KadenceWP\KadenceBlocks\StellarWP\Uplink\is_authorized;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Class responsible for sending events AI Events to Stellar Prophecy WP AI.
 */
class Kadence_Blocks_AI_Events {

	/**
	 * Event Label.
	 */
	const PROP_EVENT_LABEL = 'event_label';

	/**
	 * Event Value.
	 */
	const PROP_EVENT_DATA = 'event_data';

	/**
	 * The event endpoint.
	 */
	public const ENDPOINT = '/wp-json/prophecy/v1/analytics/event';

	/**
	 * The API domain.
	 */
	public const DOMAIN = 'https://content.startertemplatecloud.com';

	/**
	 * Registers all necessary hooks.
	 *
	 * @action plugins_loaded
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'stellarwp/analytics/event', [ $this, 'handle_event' ], 10, 2 );
		add_action( 'rest_api_init', [ $this, 'register_route' ], 10, 0 );
	}

	/**
	 * Registers the analytics/event endpoint in the REST API.
	 *
	 * @action rest_api_init
	 *
	 * @return void
	 */
	public function register_route() {
		register_rest_route(
			'kb-design-library/v1',
			'/handle_event',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'handle_event_endpoint' ),
					'permission_callback' => array( $this, 'verify_user_can_edit' ),
					'args'                => [
						self::PROP_EVENT_LABEL => [
							'description'       => __( 'The Event Label', 'kadence-blocks' ),
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						],
						self::PROP_EVENT_DATA  => [
							'description' => __( 'The Event Data', 'kadence-blocks' ),
							'type'        => 'object',
						],
					],
				)
			)
		);
	}

	/**
	 * Checks if a given request has access to search content.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return bool|WP_Error True if the request has search access, WP_Error object otherwise.
	 */
	public function verify_user_can_edit() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Sends events to Prophecy WP (if the user has installed and activated Kadence Blocks Pro).
	 *
	 * @action stellarwp/analytics/event
	 *
	 * @return void
	 */
	public function handle_event( string $name, array $context ) {

		// Only pass tracking events if AI has been activated through Opt in.
		$container     = UplinkConfig::get_container();
		$token_manager = $container->get( Token_Manager::class );
		$token         = $token_manager->get();
		$data          = $container->get( Data::class );
		$license_key   = kadence_blocks_get_current_license_key();
		$is_authorized = false;
		if ( $token ) {
			$is_authorized = is_authorized( $license_key, $token, $data->get_domain() );
		}
		if ( ! $is_authorized ) {
			return;
		}

		/**
		 * Filters the URL used to send events to.
		 *
		 * @param string The URL to use when sending events.
		 */
		$url = apply_filters( 'stellarwp/analytics/event_url', self::DOMAIN . self::ENDPOINT );

		wp_remote_post(
			$url,
			array(
				'timeout'  => 20,
				'blocking' => false,
				'headers'  => array(
					'X-Prophecy-Token' => $this->get_prophecy_token_header(),
					'Content-Type'     => 'application/json',
				),
				'body'     => wp_json_encode( [
					'name'    => $name,
					'context' => $context,
				] ),
			)
		);
	}

	/**
	 * Constructs a consistent X-Prophecy-Token header.
	 *
	 * @param array $args An array of arguments to include in the encoded header.
	 *
	 * @return string The base64 encoded string.
	 */
	public static function get_prophecy_token_header( $args = [] ) {
		$container     = UplinkConfig::get_container();
		$data          = $container->get( Data::class );

		$site_url     = $data->get_domain();
		$site_name    = get_bloginfo( 'name' );
		$license_data = kadence_blocks_get_current_license_data();

		$defaults = [
			'domain'          => $site_url,
			'key'             => ! empty( $license_data['key'] ) ? $license_data['key'] : '',
			'email'           => ! empty( $license_data['email'] ) ? $license_data['email'] : '',
			'site_name'       => $site_name,
			'product_slug'    => apply_filters( 'kadence-blocks-auth-slug', 'kadence-blocks' ),
			'product_version' => KADENCE_BLOCKS_VERSION,
		];

		$parsed_args = wp_parse_args( $args, $defaults );

		return base64_encode( json_encode( $parsed_args ) );
	}

	/**
	 * Configures various event requests to the /analytics/event endpoint
	 * and sends them to ProphecyWP.
	 *
	 * @param WP_REST_Request $request The request to the endpoint.
	 */
	public function handle_event_endpoint( $request ) {
		$event_label = $request->get_param( self::PROP_EVENT_LABEL );
		$event_data  = $request->get_param( self::PROP_EVENT_DATA );

		$event       = '';
		$context     = array();

		switch ( $event_label ) {
			case 'ai_wizard_started':
				$event = 'AI Wizard Started';
				break;

			case 'ai_wizard_update':
				$event = 'AI Wizard Update';
				$context = [
					'organization_type' => $event_data['entityType'] ?? '',
					'location_type'     => $event_data['locationType'] ?? '',
					'location'          => $event_data['location'] ?? '',
					'industry'          => $event_data['industry'] ?? '',
					'mission_statement' => $event_data['missionStatement'] ?? '',
					'keywords'          => $event_data['keywords'] ?? '',
					'tone'              => $event_data['tone'] ?? '',
					'collections'       => $event_data['customCollections'] ?? '',
				];
				break;
			case 'ai_wizard_complete':
				$event = 'AI Wizard Complete';
				$context = [
					'organization_type' => $event_data['entityType'] ?? '',
					'location_type'     => $event_data['locationType'] ?? '',
					'location'          => $event_data['location'] ?? '',
					'industry'          => $event_data['industry'] ?? '',
					'mission_statement' => $event_data['missionStatement'] ?? '',
					'keywords'          => $event_data['keywords'] ?? '',
					'tone'              => $event_data['tone'] ?? '',
					'collections'       => $event_data['customCollections'] ?? '',
				];
				break;
			case 'pattern_added_to_page':
				$event = 'Pattern Added to Page';
				$context = [
					'pattern_id'         => $event_data['id'] ?? '',
					'pattern_slug'       => $event_data['slug'] ?? '',
					'pattern_name'       => $event_data['name'] ?? '',
					'pattern_style'      => $event_data['style'] ?? '',
					'pattern_is_ai'      => $event_data['is_ai'] ?? false,
					'pattern_context'    => $event_data['context'] ?? '',
					'pattern_categories' => $event_data['categories'] ?? [],
				];
				break;
		}

		if ( strlen( $event ) !== 0 ) {
			do_action( 'stellarwp/analytics/event', $event, $context );

			return new WP_REST_Response( [ 'message' => 'Event handled.' ], 200 );
		}

		return new WP_REST_Response( array( 'message' => 'Event not handled.' ), 500 );
	}
}
