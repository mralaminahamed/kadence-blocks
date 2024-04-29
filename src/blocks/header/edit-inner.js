/**
 * BLOCK: Kadence Advanced Heading
 */

/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { useState, useCallback, Fragment, useMemo, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { get } from 'lodash';
import { addQueryArgs } from '@wordpress/url';
import { useEntityBlockEditor, useEntityProp } from '@wordpress/core-data';
import {
	InspectorControls,
	useInnerBlocksProps,
	InspectorAdvancedControls,
	store as editorStore,
	BlockContextProvider,
} from '@wordpress/block-editor';
import { TextControl, ExternalLink, Button, Placeholder, ToggleControl, SelectControl } from '@wordpress/components';
import { formBlockIcon } from '@kadence/icons';
import {
	KadencePanelBody,
	InspectorControlTabs,
	ResponsiveMeasureRangeControl,
	ResponsiveMeasurementControls,
	ResponsiveBorderControl,
	TypographyControls,
	PopColorControl,
	ColorGroup,
	BackgroundControl as KadenceBackgroundControl,
	HoverToggleControl,
	ResponsiveAlignControls,
	ResponsiveRangeControls,
	BackgroundTypeControl,
	GradientControl,
	ResponsiveSelectControl,
	SmallResponsiveControl,
} from '@kadence/components';
import { getPreviewSize, mouseOverVisualizer, arrayStringToInt, useElementWidth } from '@kadence/helpers';

import { FormTitle, BackendStyles, SelectForm } from './components';

/**
 * Internal dependencies
 */
import classnames from 'classnames';
import { useEntityPublish } from './hooks';

/**
 * Regular expression matching invalid anchor characters for replacement.
 *
 * @type {RegExp}
 */
const ANCHOR_REGEX = /[\s#]/g;

const INNERBLOCK_TEMPLATE = [
	createBlock('kadence/header-container-desktop', {}, [
		createBlock('kadence/header-row', { metadata: { name: __('Top Row', 'kadence-blocks') }, location: 'top' }, [
			createBlock(
				'kadence/header-section',
				{ metadata: { name: __('Left Section', 'kadence-blocks') }, location: 'left' },
				[
					createBlock(
						'kadence/header-column',
						{ metadata: { name: __('Left', 'kadence-blocks') }, location: 'left' },
						[]
					),
					createBlock(
						'kadence/header-column',
						{ metadata: { name: __('Center Left', 'kadence-blocks') }, location: 'center-left' },
						[]
					),
				]
			),
			createBlock('kadence/header-column', {
				metadata: { name: __('Center', 'kadence-blocks') },
				location: 'center',
			}),
			createBlock(
				'kadence/header-section',
				{ metadata: { name: __('Right Section', 'kadence-blocks') }, location: 'right' },
				[
					createBlock(
						'kadence/header-column',
						{ metadata: { name: __('Center Right', 'kadence-blocks') }, location: 'center-right' },
						[]
					),
					createBlock(
						'kadence/header-column',
						{ metadata: { name: __('Right', 'kadence-blocks') }, location: 'right' },
						[]
					),
				]
			),
		]),
		createBlock(
			'kadence/header-row',
			{ metadata: { name: __('Middle Row', 'kadence-blocks') }, location: 'center' },
			[
				createBlock(
					'kadence/header-section',
					{ metadata: { name: __('Left Section', 'kadence-blocks') }, location: 'left' },
					[
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Left', 'kadence-blocks') }, location: 'left' },
							[]
						),
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Center Left', 'kadence-blocks') }, location: 'center-left' },
							[]
						),
					]
				),
				createBlock('kadence/header-column', {
					metadata: { name: __('Center', 'kadence-blocks') },
					location: 'center',
				}),
				createBlock(
					'kadence/header-section',
					{ metadata: { name: __('Right Section', 'kadence-blocks') }, location: 'right' },
					[
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Center Right', 'kadence-blocks') }, location: 'center-right' },
							[]
						),
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Right', 'kadence-blocks') }, location: 'right' },
							[]
						),
					]
				),
			]
		),
		createBlock(
			'kadence/header-row',
			{ metadata: { name: __('Bottom Row', 'kadence-blocks') }, location: 'bottom' },
			[
				createBlock(
					'kadence/header-section',
					{ metadata: { name: __('Left Section', 'kadence-blocks') }, location: 'left' },
					[
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Left', 'kadence-blocks') }, location: 'left' },
							[]
						),
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Center Left', 'kadence-blocks') }, location: 'center-left' },
							[]
						),
					]
				),
				createBlock('kadence/header-column', {
					metadata: { name: __('Center', 'kadence-blocks') },
					location: 'center',
				}),
				createBlock(
					'kadence/header-section',
					{ metadata: { name: __('Right Section', 'kadence-blocks') }, location: 'right' },
					[
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Center Right', 'kadence-blocks') }, location: 'center-right' },
							[]
						),
						createBlock(
							'kadence/header-column',
							{ metadata: { name: __('Right', 'kadence-blocks') }, location: 'right' },
							[]
						),
					]
				),
			]
		),
	]),
	createBlock('kadence/header-container-tablet', {}, [
		createBlock('kadence/header-row', { metadata: { name: __('Top Row', 'kadence-blocks') } }, [
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Left', 'kadence-blocks') }, location: 'tablet-left' },
				[]
			),
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Center', 'kadence-blocks'), location: 'tablet-center' } },
				[]
			),
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Right', 'kadence-blocks') }, location: 'tablet-right' },
				[]
			),
		]),
		createBlock('kadence/header-row', { metadata: { name: __('Middle Row', 'kadence-blocks') } }, [
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Left', 'kadence-blocks') }, location: 'tablet-left' },
				[]
			),
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Center', 'kadence-blocks'), location: 'tablet-center' } },
				[]
			),
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Right', 'kadence-blocks') }, location: 'tablet-right' },
				[]
			),
		]),
		createBlock('kadence/header-row', { metadata: { name: __('Bottom Row', 'kadence-blocks') } }, [
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Left', 'kadence-blocks') }, location: 'tablet-left' },
				[]
			),
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Center', 'kadence-blocks'), location: 'tablet-center' } },
				[]
			),
			createBlock(
				'kadence/header-column',
				{ metadata: { name: __('Right', 'kadence-blocks') }, location: 'tablet-right' },
				[]
			),
		]),
	]),
	createBlock('kadence/off-canvas', {}, []),
];

const ALLOWED_BLOCKS = [
	'kadence/header-container-desktop',
	'kadence/header-container-tablet',
	'kadence/header-row',
	'kadence/header-column',
	'kadence/off-canvas',
];

export function EditInner(props) {
	const { attributes, setAttributes, clientId, context, direct, id, isSelected } = props;
	const { uniqueID } = attributes;

	const { previewDevice } = useSelect(
		(select) => {
			return {
				previewDevice: select('kadenceblocks/data').getPreviewDeviceType(),
			};
		},
		[clientId]
	);

	const componentRef = useRef();

	const [activeTab, setActiveTab] = useState('general');

	const paddingMouseOver = mouseOverVisualizer();
	const marginMouseOver = mouseOverVisualizer();

	const [meta, setMeta] = useHeaderProp('meta');

	const metaAttributes = {
		padding: meta?._kad_header_padding,
		tabletPadding: meta?._kad_header_tabletPadding,
		mobilePadding: meta?._kad_header_mobilePadding,
		paddingUnit: meta?._kad_header_paddingUnit,
		margin: meta?._kad_header_margin,
		tabletMargin: meta?._kad_header_tabletMargin,
		mobileMargin: meta?._kad_header_mobileMargin,
		marginUnit: meta?._kad_header_marginUnit,
		border: meta?._kad_header_border,
		borderTablet: meta?._kad_header_borderTablet,
		borderMobile: meta?._kad_header_borderMobile,
		borderUnit: meta?._kad_header_borderUnit,
		borderHover: meta?._kad_header_borderHover,
		borderHoverTablet: meta?._kad_header_borderHoverTablet,
		borderHoverMobile: meta?._kad_header_borderHoverMobile,
		borderHoverUnit: meta?._kad_header_borderHoverUnit,
		borderRadius: meta?._kad_header_borderRadius,
		borderRadiusTablet: meta?._kad_header_borderRadiusTablet,
		borderRadiusMobile: meta?._kad_header_borderRadiusMobile,
		borderRadiusUnit: meta?._kad_header_borderRadiusUnit,
		borderRadiusHover: meta?._kad_header_borderRadiusHover,
		borderRadiusHoverTablet: meta?._kad_header_borderRadiusHoverTablet,
		borderRadiusHoverMobile: meta?._kad_header_borderRadiusHoverMobile,
		borderRadiusHoverUnit: meta?._kad_header_borderRadiusHoverUnit,
		borderTransparent: meta?._kad_header_borderTransparent,
		borderTransparentTablet: meta?._kad_header_borderTransparentTablet,
		borderTransparentMobile: meta?._kad_header_borderTransparentMobile,
		borderTransparentUnit: meta?._kad_header_borderTransparentUnit,
		borderTransparentHover: meta?._kad_header_borderTransparentHover,
		borderTransparentHoverTablet: meta?._kad_header_borderTransparentHoverTablet,
		borderTransparentHoverMobile: meta?._kad_header_borderTransparentHoverMobile,
		borderTransparentHoverUnit: meta?._kad_header_borderTransparentHoverUnit,
		borderRadiusTransparent: meta?._kad_header_borderRadiusTransparent,
		borderRadiusTransparentTablet: meta?._kad_header_borderRadiusTransparentTablet,
		borderRadiusTransparentMobile: meta?._kad_header_borderRadiusTransparentMobile,
		borderRadiusTransparentUnit: meta?._kad_header_borderRadiusTransparentUnit,
		borderRadiusTransparentHover: meta?._kad_header_borderRadiusTransparentHover,
		borderRadiusTransparentHoverTablet: meta?._kad_header_borderRadiusTransparentHoverTablet,
		borderRadiusTransparentHoverMobile: meta?._kad_header_borderRadiusTransparentHoverMobile,
		borderRadiusTransparentHoverUnit: meta?._kad_header_borderRadiusTransparentHoverUnit,
		borderSticky: meta?._kad_header_borderSticky,
		borderStickyTablet: meta?._kad_header_borderStickyTablet,
		borderStickyMobile: meta?._kad_header_borderStickyMobile,
		borderStickyUnit: meta?._kad_header_borderStickyUnit,
		borderStickyHover: meta?._kad_header_borderStickyHover,
		borderStickyHoverTablet: meta?._kad_header_borderStickyHoverTablet,
		borderStickyHoverMobile: meta?._kad_header_borderStickyHoverMobile,
		borderStickyHoverUnit: meta?._kad_header_borderStickyHoverUnit,
		borderRadiusSticky: meta?._kad_header_borderRadiusSticky,
		borderRadiusStickyTablet: meta?._kad_header_borderRadiusStickyTablet,
		borderRadiusStickyMobile: meta?._kad_header_borderRadiusStickyMobile,
		borderRadiusStickyUnit: meta?._kad_header_borderRadiusStickyUnit,
		borderRadiusStickyHover: meta?._kad_header_borderRadiusStickyHover,
		borderRadiusStickyHoverTablet: meta?._kad_header_borderRadiusStickyHoverTablet,
		borderRadiusStickyHoverMobile: meta?._kad_header_borderRadiusStickyHoverMobile,
		borderRadiusStickyHoverUnit: meta?._kad_header_borderRadiusStickyHoverUnit,
		flex: meta?._kad_header_flex,
		className: meta?._kad_header_className,
		anchor: meta?._kad_header_anchor,
		background: meta?._kad_header_background,
		backgroundHover: meta?._kad_header_backgroundHover,
		backgroundTransparent: meta?._kad_header_backgroundTransparent,
		backgroundTransparentHover: meta?._kad_header_backgroundTransparentHover,
		backgroundSticky: meta?._kad_header_backgroundSticky,
		backgroundStickyHover: meta?._kad_header_backgroundStickyHover,
		typography: meta?._kad_header_typography,
		linkColor: meta?._kad_header_linkColor,
		linkHoverColor: meta?._kad_header_linkHoverColor,
		height: meta?._kad_header_height,
		heightUnit: meta?._kad_header_heightUnit,
		width: meta?._kad_header_width,
		widthUnit: meta?._kad_header_widthUnit,
		isSticky: meta?._kad_header_isSticky,
		isStickyTablet: meta?._kad_header_isStickyTablet,
		isStickyMobile: meta?._kad_header_isStickyMobile,
		isTransparent: meta?._kad_header_isTransparent,
		isTransparentTablet: meta?._kad_header_isTransparentTablet,
		isTransparentMobile: meta?._kad_header_isTransparentMobile,
		autoTransparentSpacing: meta?._kad_header_autoTransparentSpacing,
		stickySection: meta?._kad_header_stickySection,
		stickySectionTablet: meta?._kad_header_stickySectionTablet,
		stickySectionMobile: meta?._kad_header_stickySectionMobile,
		shrinkMain: meta?._kad_header_shrinkMain,
		shrinkMainHeight: meta?._kad_header_shrinkMainHeight,
		shrinkMainHeightTablet: meta?._kad_header_shrinkMainHeightTablet,
		shrinkMainHeightMobile: meta?._kad_header_shrinkMainHeightMobile,
		revealScrollUp: meta?._kad_header_revealScrollUp,
	};

	const {
		padding,
		tabletPadding,
		mobilePadding,
		paddingUnit,
		margin,
		tabletMargin,
		mobileMargin,
		marginUnit,
		border,
		borderTablet,
		borderMobile,
		borderHover,
		borderHoverTablet,
		borderHoverMobile,
		borderRadius,
		borderRadiusTablet,
		borderRadiusMobile,
		borderRadiusUnit,
		borderRadiusHover,
		borderRadiusHoverTablet,
		borderRadiusHoverMobile,
		borderRadiusHoverUnit,
		borderTransparent,
		borderTransparentTablet,
		borderTransparentMobile,
		borderTransparentHover,
		borderTransparentHoverTablet,
		borderTransparentHoverMobile,
		borderRadiusTransparent,
		borderRadiusTransparentTablet,
		borderRadiusTransparentMobile,
		borderRadiusTransparentUnit,
		borderRadiusTransparentHover,
		borderRadiusTransparentHoverTablet,
		borderRadiusTransparentHoverMobile,
		borderRadiusTransparentHoverUnit,
		borderSticky,
		borderStickyTablet,
		borderStickyMobile,
		borderStickyHover,
		borderStickyHoverTablet,
		borderStickyHoverMobile,
		borderRadiusSticky,
		borderRadiusStickyTablet,
		borderRadiusStickyMobile,
		borderRadiusStickyUnit,
		borderRadiusStickyHover,
		borderRadiusStickyHoverTablet,
		borderRadiusStickyHoverMobile,
		borderRadiusStickyHoverUnit,
		flex,
		className,
		anchor,
		background,
		backgroundHover,
		backgroundTransparent,
		backgroundTransparentHover,
		backgroundSticky,
		backgroundStickyHover,
		typography,
		linkColor,
		linkHoverColor,
		height,
		heightUnit,
		width,
		widthUnit,
		isSticky,
		isStickyTablet,
		isStickyMobile,
		isTransparent,
		isTransparentTablet,
		isTransparentMobile,
		autoTransparentSpacing,
		stickySection,
		stickySectionTablet,
		stickySectionMobile,
		shrinkMain,
		shrinkMainHeight,
		shrinkMainHeightTablet,
		shrinkMainHeightMobile,
		revealScrollUp,
	} = metaAttributes;

	const setMetaAttribute = (value, key) => {
		setMeta({ ...meta, ['_kad_header_' + key]: value });
	};

	// Flex direction options
	const previewDirection = getPreviewSize(
		previewDevice,
		undefined !== flex?.direction?.[0] ? flex.direction[0] : '',
		undefined !== flex?.direction?.[1] ? flex.direction[1] : '',
		undefined !== flex?.direction?.[2] ? flex.direction[2] : ''
	);
	const previewIsSticky = getPreviewSize(previewDevice, isSticky, isStickyTablet, isStickyMobile);
	const previewIsTransparent = getPreviewSize(previewDevice, isTransparent, isTransparentTablet, isTransparentMobile);

	const previewStickySection = getPreviewSize(
		previewDevice,
		stickySection ? stickySection : 'main',
		stickySectionTablet,
		stickySectionMobile
	);

	const [title, setTitle] = useHeaderProp('title');

	let [blocks, onInput, onChange] = useEntityBlockEditor('postType', 'kadence_header', id);
	const { updateBlockAttributes } = useDispatch(editorStore);

	const emptyHeader = useMemo(() => {
		return [createBlock('kadence/header', {})];
	}, [clientId]);

	if (blocks.length === 0) {
		blocks = emptyHeader;
	}

	const headerInnerBlocks = useMemo(() => {
		return get(blocks, [0, 'innerBlocks'], []);
	}, [blocks]);

	const newBlock = useMemo(() => {
		return get(blocks, [0], {});
	}, [blocks]);

	const [isAdding, addNew] = useEntityPublish('kadence_header', id);
	const onAdd = async (title, template, initialDescription) => {
		try {
			const response = await addNew();

			if (response.id) {
				onChange(
					[
						{
							...newBlock,
							innerBlocks: INNERBLOCK_TEMPLATE,
						},
					],
					clientId
				);

				setTitle(title);

				const updatedMeta = meta;
				updatedMeta._kad_header_description = initialDescription;

				setMeta({ ...meta, updatedMeta });
				await wp.data.dispatch('core').saveEditedEntityRecord('postType', 'kadence_header', id);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const backgroundStyleControls = (size = '', suffix = '') => {
		const backgroundValue = metaAttributes['background' + suffix + size];
		const backgroundHoverValue = metaAttributes['background' + suffix + 'Hover' + size];
		return (
			<>
				<HoverToggleControl
					normal={
						<>
							<BackgroundTypeControl
								label={__('Type', 'kadence-blocks')}
								type={undefined != backgroundValue?.type ? backgroundValue.type : 'normal'}
								onChange={(value) =>
									setMetaAttribute({ ...backgroundValue, type: value }, 'background' + suffix + size)
								}
								allowedTypes={['normal', 'gradient']}
							/>
							{'normal' === backgroundValue?.type && (
								<>
									<PopColorControl
										label={__('Background Color', 'kadence-blocks')}
										value={undefined !== backgroundValue?.color ? backgroundValue.color : ''}
										default={''}
										onChange={(value) => {
											setMetaAttribute(
												{ ...backgroundValue, color: value },
												'background' + suffix + size
											);
										}}
									/>
									<KadenceBackgroundControl
										label={__('Background Image', 'kadence-blocks')}
										hasImage={
											undefined === backgroundValue.image || '' === backgroundValue.image
												? false
												: true
										}
										imageURL={backgroundValue.image ? backgroundValue.image : ''}
										imageID={backgroundValue.imageID}
										imagePosition={
											backgroundValue.position ? backgroundValue.position : 'center center'
										}
										imageSize={backgroundValue.size ? backgroundValue.size : 'cover'}
										imageRepeat={backgroundValue.repeat ? backgroundValue.repeat : 'no-repeat'}
										imageAttachment={
											backgroundValue.attachment ? backgroundValue.attachment : 'scroll'
										}
										imageAttachmentParallax={true}
										onRemoveImage={() => {
											setMetaAttribute(
												{ ...backgroundValue, imageID: undefined },
												'background' + suffix + size
											);
											setMetaAttribute(
												{ ...backgroundValue, image: undefined },
												'background' + suffix + size
											);
										}}
										onSaveImage={(value) => {
											setMetaAttribute(
												{ ...backgroundValue, imageID: value.id.toString() },
												'background' + suffix + size
											);
											setMetaAttribute(
												{ ...backgroundValue, image: value.url },
												'background' + suffix + size
											);
										}}
										onSaveURL={(newURL) => {
											if (newURL !== backgroundValue.image) {
												setMetaAttribute(
													{ ...backgroundValue, imageID: undefined },
													'background' + suffix + size
												);
												setMetaAttribute(
													{ ...backgroundValue, image: newURL },
													'background' + suffix + size
												);
											}
										}}
										onSavePosition={(value) =>
											setMetaAttribute(
												{ ...backgroundValue, position: value },
												'background' + suffix + size
											)
										}
										onSaveSize={(value) =>
											setMetaAttribute(
												{ ...backgroundValue, size: value },
												'background' + suffix + size
											)
										}
										onSaveRepeat={(value) =>
											setMetaAttribute(
												{ ...backgroundValue, repeat: value },
												'background' + suffix + size
											)
										}
										onSaveAttachment={(value) =>
											setMetaAttribute(
												{ ...backgroundValue, attachment: value },
												'background' + suffix + size
											)
										}
										disableMediaButtons={backgroundValue.image ? true : false}
										dynamicAttribute={'background' + suffix + size + ':image'}
										isSelected={isSelected}
										attributes={attributes}
										setAttributes={setAttributes}
										name={'kadence/header'}
										clientId={clientId}
										context={context}
									/>
								</>
							)}
							{'gradient' === backgroundValue?.type && (
								<>
									<GradientControl
										value={backgroundValue?.gradient}
										onChange={(value) => {
											setMetaAttribute(
												{ ...backgroundValue, gradient: value },
												'background' + suffix + size
											);
										}}
										gradients={[]}
									/>
								</>
							)}
						</>
					}
					hover={
						<>
							<BackgroundTypeControl
								label={__('Hover Type', 'kadence-blocks')}
								type={undefined != backgroundHoverValue?.type ? backgroundHoverValue.type : 'normal'}
								onChange={(value) =>
									setMetaAttribute(
										{ ...backgroundHoverValue, type: value },
										'background' + suffix + 'Hover' + size
									)
								}
								allowedTypes={['normal', 'gradient']}
							/>
							{'normal' === backgroundHoverValue?.type && (
								<>
									<PopColorControl
										label={__('Background Color', 'kadence-blocks')}
										value={
											undefined !== backgroundHoverValue?.color ? backgroundHoverValue.color : ''
										}
										default={''}
										onChange={(value) => {
											setMetaAttribute(
												{ ...backgroundHoverValue, color: value },
												'backgroundHover'
											);
										}}
									/>
									<KadenceBackgroundControl
										label={__('Background Image', 'kadence-blocks')}
										hasImage={
											undefined === backgroundHoverValue.image ||
											'' === backgroundHoverValue.image
												? false
												: true
										}
										imageURL={backgroundHoverValue.image ? backgroundHoverValue.image : ''}
										imageID={backgroundHoverValue.imageID}
										imagePosition={
											backgroundHoverValue.imagePosition
												? backgroundHoverValue.imagePosition
												: 'center center'
										}
										imageSize={
											backgroundHoverValue.imageSize ? backgroundHoverValue.imageSize : 'cover'
										}
										imageRepeat={
											backgroundHoverValue.imageRepeat
												? backgroundHoverValue.imageRepeat
												: 'no-repeat'
										}
										imageAttachment={
											backgroundHoverValue.imageAttachment
												? backgroundHoverValue.imageAttachment
												: 'scroll'
										}
										imageAttachmentParallax={true}
										onRemoveImage={() => {
											setMetaAttribute(
												{ ...backgroundHoverValue, imageID: undefined },
												'backgroundHover'
											);
											setMetaAttribute(
												{ ...backgroundHoverValue, image: undefined },
												'backgroundHover'
											);
										}}
										onSaveImage={(value) => {
											setMetaAttribute(
												{ ...backgroundHoverValue, imageID: value.id.toString() },
												'backgroundHover'
											);
											setMetaAttribute(
												{ ...backgroundHoverValue, image: value.url },
												'backgroundHover'
											);
										}}
										onSaveURL={(newURL) => {
											if (newURL !== backgroundHoverValue.image) {
												setMetaAttribute(
													{ ...backgroundHoverValue, imageID: undefined },
													'backgroundHover'
												);
												setMetaAttribute(
													{ ...backgroundHoverValue, image: newURL },
													'backgroundHover'
												);
											}
										}}
										onSavePosition={(value) =>
											setMetaAttribute(
												{ ...backgroundHoverValue, imagePosition: value },
												'backgroundHover'
											)
										}
										onSaveSize={(value) =>
											setMetaAttribute(
												{ ...backgroundHoverValue, imageSize: value },
												'backgroundHover'
											)
										}
										onSaveRepeat={(value) =>
											setMetaAttribute(
												{ ...backgroundHoverValue, imageRepeat: value },
												'backgroundHover'
											)
										}
										onSaveAttachment={(value) =>
											setMetaAttribute(
												{ ...backgroundHoverValue, imageAttachment: value },
												'backgroundHover'
											)
										}
										disableMediaButtons={backgroundHoverValue.image ? true : false}
										dynamicAttribute={'backgroundHover:image'}
										isSelected={isSelected}
										attributes={attributes}
										setAttributes={setAttributes}
										name={'kadence/header'}
										clientId={clientId}
										context={context}
									/>
								</>
							)}
							{'gradient' === backgroundHoverValue?.type && (
								<>
									<GradientControl
										value={backgroundHoverValue?.gradient}
										onChange={(value) => {
											setMetaAttribute(
												{ ...backgroundHoverValue, gradient: value },
												'backgroundHover'
											);
										}}
										gradients={[]}
									/>
								</>
							)}
						</>
					}
				/>
			</>
		);
	};

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: '',
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			value: !direct ? headerInnerBlocks : undefined,
			onInput: !direct ? (a, b) => onInput([{ ...newBlock, innerBlocks: a }], b) : undefined,
			onChange: !direct ? (a, b) => onChange([{ ...newBlock, innerBlocks: a }], b) : undefined,
			templateLock: 'all',
			template: INNERBLOCK_TEMPLATE,
		}
	);

	if (headerInnerBlocks.length === 0) {
		return (
			<>
				<FormTitle onAdd={onAdd} isAdding={isAdding} existingTitle={title} />
				<div className="kb-form-hide-while-setting-up">
					<Fragment {...innerBlocksProps} />
				</div>
			</>
		);
	}
	if (typeof pagenow !== 'undefined' && ('widgets' === pagenow || 'customize' === pagenow)) {
		const editPostLink = addQueryArgs('post.php', {
			post: id,
			action: 'edit',
		});
		return (
			<>
				<Placeholder
					className="kb-select-or-create-placeholder"
					label={__('Kadence Heading', 'kadence-blocks')}
					icon={formBlockIcon}
				>
					<p style={{ width: '100%', marginBottom: '10px' }}>
						{__('Advanced Headers can not be edited within the widgets screen.', 'kadence-blocks')}
					</p>
					<Button href={editPostLink} variant="primary" className="kb-form-edit-link">
						{__('Edit Form', 'kadence-blocks')}
					</Button>
				</Placeholder>
				<InspectorControls>
					<KadencePanelBody
						panelName={'kb-advanced-form-selected-switch'}
						title={__('Selected Header', 'kadence-blocks')}
					>
						<SelectForm
							postType="kadence_header"
							label={__('Selected Header', 'kadence-blocks')}
							hideLabelFromVision={true}
							onChange={(nextId) => {
								setAttributes({ id: parseInt(nextId) });
							}}
							value={id}
						/>
					</KadencePanelBody>
				</InspectorControls>
			</>
		);
	}
	return (
		<>
			<BackendStyles
				{...props}
				metaAttributes={metaAttributes}
				previewDevice={previewDevice}
				currentRef={componentRef}
			/>
			<InspectorControls>
				<InspectorControlTabs
					panelName={'advanced-header'}
					setActiveTab={(value) => setActiveTab(value)}
					activeTab={activeTab}
				/>

				{activeTab === 'general' && (
					<>
						<KadencePanelBody
							title={__('General Settings', 'kadence-blocks')}
							panelName={'kb-col-flex-settings'}
						>
							<ResponsiveSelectControl
								label={__('Sticky Header', 'kadence-blocks')}
								value={isSticky}
								tabletValue={isStickyTablet}
								mobileValue={isStickyMobile}
								options={[
									{ value: '', label: __('-', 'kadence-blocks') },
									{ value: '1', label: __('Yes', 'kadence-blocks') },
									{ value: '0', label: __('No', 'kadence-blocks') },
								]}
								onChange={(value) => setMetaAttribute(value, 'isSticky')}
								onChangeTablet={(value) => setMetaAttribute(value, 'isStickyTablet')}
								onChangeMobile={(value) => setMetaAttribute(value, 'isStickyMobile')}
							/>
							<ResponsiveSelectControl
								label={__('Transparent Header', 'kadence-blocks')}
								value={isTransparent}
								tabletValue={isTransparentTablet}
								mobileValue={isTransparentMobile}
								options={[
									{ value: '', label: __('-', 'kadence-blocks') },
									{ value: '1', label: __('Yes', 'kadence-blocks') },
									{ value: '0', label: __('No', 'kadence-blocks') },
								]}
								onChange={(value) => setMetaAttribute(value, 'isTransparent')}
								onChangeTablet={(value) => setMetaAttribute(value, 'isTransparentTablet')}
								onChangeMobile={(value) => setMetaAttribute(value, 'isTransparentMobile')}
							/>
							{previewIsTransparent == '1' && (
								<ToggleControl
									label={__('Auto spacing under', 'kadence-blocks')}
									checked={autoTransparentSpacing}
									onChange={(value) => setMetaAttribute(value, 'autoTransparentSpacing')}
								/>
							)}
							{previewIsSticky == '1' && (
								<>
									<ResponsiveSelectControl
										label={__('Sticky Section', 'kadence-blocks')}
										value={stickySection}
										tabletValue={stickySectionTablet}
										mobileValue={stickySectionMobile}
										options={[
											{ value: 'top_main_bottom', label: __('Whole Header', 'kadence-blocks') },
											// { value: 'main', label: __('Only Main Row', 'kadence-blocks') },
											// { value: 'top', label: __('Only Top Row', 'kadence-blocks') },
											// { value: 'bottom', label: __('Only Bottom Row', 'kadence-blocks') },
											// { value: 'top_main', label: __('Top and Main Row', 'kadence-blocks') },
										]}
										onChange={(value) => setMetaAttribute(value, 'stickySection')}
										onChangeTablet={(value) => setMetaAttribute(value, 'stickySectionTablet')}
										onChangeMobile={(value) => setMetaAttribute(value, 'stickySectionMobile')}
									/>
									<ToggleControl
										label={__('Reveal on scroll up', 'kadence-blocks')}
										checked={revealScrollUp}
										onChange={(value) => setMetaAttribute(value, 'revealScrollUp')}
									/>
									<ToggleControl
										label={__('Shrink Main Row', 'kadence-blocks')}
										checked={shrinkMain}
										onChange={(value) => setMetaAttribute(value, 'shrinkMain')}
									/>
									{shrinkMain &&
										(previewStickySection.includes('main') || previewStickySection == '') && (
											<ResponsiveRangeControls
												label={__('Main Row Shrink Height', 'kadence-blocks')}
												value={parseFloat(shrinkMainHeight)}
												valueTablet={parseFloat(shrinkMainHeightTablet)}
												valueMobile={parseFloat(shrinkMainHeightMobile)}
												onChange={(value) =>
													setMetaAttribute(value.toString(), 'shrinkMainHeight')
												}
												onChangeTablet={(value) =>
													setMetaAttribute(value.toString(), 'shrinkMainHeightTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value.toString(), 'shrinkMainHeightMobile')
												}
												min={0}
												max={500}
												step={1}
												unit={'px'}
												units={['px']}
												showUnit={true}
											/>
										)}
								</>
							)}
						</KadencePanelBody>
						<KadencePanelBody
							title={__('Flex Settings', 'kadence-blocks')}
							panelName={'kb-col-flex-settings'}
						>
							<ResponsiveAlignControls
								label={__('Direction', 'kadence-blocks')}
								value={flex.direction && flex.direction[0] ? flex.direction[0] : 'vertical'}
								tabletValue={flex.direction && flex.direction[1] ? flex.direction[1] : ''}
								mobileValue={flex.direction && flex.direction[2] ? flex.direction[2] : ''}
								onChange={(value) => {
									if (value) {
										setMetaAttribute(
											{
												...flex,
												direction: [
													value,
													undefined !== flex.direction?.[1] ? flex.direction[1] : '',
													undefined !== flex.direction?.[2] ? flex.direction[2] : '',
												],
											},
											'flex'
										);
									}
								}}
								onChangeTablet={(value) => {
									let tempValue = value;
									if (flex.direction && flex.direction[1] && tempValue === flex.direction[1]) {
										tempValue = '';
									}
									setMetaAttribute(
										{
											...flex,
											direction: [
												undefined !== flex.direction?.[0] ? flex.direction[0] : '',
												tempValue,
												undefined !== flex.direction?.[2] ? flex.direction[2] : '',
											],
										},
										'flex'
									);
								}}
								onChangeMobile={(value) => {
									let tempValue = value;
									if (flex.direction && flex.direction[2] && tempValue === flex.direction[2]) {
										tempValue = '';
									}
									setMetaAttribute(
										{
											...flex,
											direction: [
												undefined !== flex.direction?.[0] ? flex.direction[0] : '',
												undefined !== flex.direction?.[1] ? flex.direction[1] : '',
												tempValue,
											],
										},
										'flex'
									);
								}}
								type={'orientation-column'}
							/>
							<div className="kt-sidebar-settings-spacer"></div>
							{(previewDirection === 'horizontal-reverse' || previewDirection === 'horizontal') && (
								<ResponsiveAlignControls
									label={__('Alignment', 'kadence-blocks')}
									value={
										flex.justifyContent && flex.justifyContent?.[0] ? flex.justifyContent[0] : ''
									}
									tabletValue={
										flex.justifyContent && flex.justifyContent?.[1] ? flex.justifyContent[1] : ''
									}
									mobileValue={
										flex.justifyContent && flex.justifyContent?.[2] ? flex.justifyContent[2] : ''
									}
									onChange={(value) => {
										let tempValue = value;
										if (
											(flex.justifyContent && flex.justifyContent?.[0]
												? flex.justifyContent[0]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												justifyContent: [
													tempValue,
													flex.justifyContent && flex.justifyContent[1]
														? flex.justifyContent[1]
														: '',
													flex.justifyContent && flex.justifyContent[2]
														? flex.justifyContent[2]
														: '',
												],
											},
											'flex'
										);
									}}
									onChangeTablet={(value) => {
										let tempValue = value;
										if (
											(flex.justifyContent && flex.justifyContent?.[1]
												? flex.justifyContent[1]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												justifyContent: [
													flex.justifyContent && flex.justifyContent?.[0]
														? flex.justifyContent[0]
														: '',
													tempValue,
													flex.justifyContent && flex.justifyContent[2]
														? flex.justifyContent[2]
														: '',
												],
											},
											'flex'
										);
									}}
									onChangeMobile={(value) => {
										let tempValue = value;
										if (
											(flex.justifyContent && flex.justifyContent?.[2]
												? flex.justifyContent[2]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												justifyContent: [
													flex.justifyContent && flex.justifyContent?.[0]
														? flex.justifyContent[0]
														: '',
													flex.justifyContent && flex.justifyContent[1]
														? flex.justifyContent[1]
														: '',
													tempValue,
												],
											},
											'flex'
										);
									}}
									type={'justify-column'}
									reverse={previewDirection === 'horizontal-reverse' ? true : false}
								/>
							)}
							{(previewDirection === 'vertical-reverse' || previewDirection === 'vertical') && (
								<ResponsiveAlignControls
									label={__('Alignment', 'kadence-blocks')}
									value={
										flex.justifyContent && flex.justifyContent?.[0] ? flex.justifyContent[0] : ''
									}
									tabletValue={
										flex.justifyContent && flex.justifyContent?.[1] ? flex.justifyContent[1] : ''
									}
									mobileValue={
										flex.justifyContent && flex.justifyContent?.[2] ? flex.justifyContent[2] : ''
									}
									onChange={(value) => {
										let tempValue = value;
										if (
											(flex.justifyContent && flex.justifyContent?.[0]
												? flex.justifyContent[0]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												justifyContent: [
													tempValue,
													flex.justifyContent && flex.justifyContent[1]
														? flex.justifyContent[1]
														: '',
													flex.justifyContent && flex.justifyContent[2]
														? flex.justifyContent[2]
														: '',
												],
											},
											'flex'
										);
									}}
									onChangeTablet={(value) => {
										let tempValue = value;
										if (
											(flex.justifyContent && flex.justifyContent?.[1]
												? flex.justifyContent[1]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												justifyContent: [
													flex.justifyContent && flex.justifyContent?.[0]
														? flex.justifyContent[0]
														: '',
													tempValue,
													flex.justifyContent && flex.justifyContent[2]
														? flex.justifyContent[2]
														: '',
												],
											},
											'flex'
										);
									}}
									onChangeMobile={(value) => {
										let tempValue = value;
										if (
											(flex.justifyContent && flex.justifyContent?.[2]
												? flex.justifyContent[2]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												justifyContent: [
													flex.justifyContent && flex.justifyContent?.[0]
														? flex.justifyContent[0]
														: '',
													flex.justifyContent && flex.justifyContent[1]
														? flex.justifyContent[1]
														: '',
													tempValue,
												],
											},
											'flex'
										);
									}}
									type={'justify-align'}
									reverse={previewDirection === 'horizontal-reverse' ? true : false}
								/>
							)}
							{(previewDirection === 'vertical-reverse' || previewDirection === 'vertical') && (
								<ResponsiveAlignControls
									label={__('Vertical Alignment', 'kadence-blocks')}
									value={undefined !== flex?.verticalAlignment?.[0] ? flex.verticalAlignment[0] : ''}
									mobileValue={
										undefined !== flex?.verticalAlignment?.[2] ? flex.verticalAlignment[2] : ''
									}
									tabletValue={
										undefined !== flex?.verticalAlignment?.[1] ? flex.verticalAlignment[1] : ''
									}
									onChange={(value) => {
										let tempValue = value;
										if (
											(flex.verticalAlignment && flex.verticalAlignment?.[0]
												? flex.verticalAlignment[0]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												verticalAlignment: [
													tempValue,
													flex.verticalAlignment && flex.verticalAlignment?.[1]
														? flex.verticalAlignment[1]
														: '',
													flex.verticalAlignment && flex.verticalAlignment?.[2]
														? flex.verticalAlignment[2]
														: '',
												],
											},
											'flex'
										);
									}}
									onChangeTablet={(value) => {
										let tempValue = value;
										if (
											(undefined !== flex?.verticalAlignment?.[1]
												? flex.verticalAlignment[1]
												: '') === value
										) {
											tempValue = '';
										}
										setMetaAttribute(
											{
												...flex,
												verticalAlignment: [
													flex.verticalAlignment && flex.verticalAlignment?.[0]
														? flex.verticalAlignment[0]
														: '',
													tempValue,
													flex.verticalAlignment && flex.verticalAlignment?.[2]
														? flex.verticalAlignment[2]
														: '',
												],
											},
											'flex'
										);
									}}
									onChangeMobile={(value) => {
										setMetaAttribute(
											{
												...flex,
												verticalAlignment: [
													flex.verticalAlignment && flex.verticalAlignment?.[0]
														? flex.verticalAlignment[0]
														: '',
													flex.verticalAlignment && flex.verticalAlignment?.[1]
														? flex.verticalAlignment[1]
														: '',
													value,
												],
											},
											'flex'
										);
									}}
									type={'justify-vertical'}
									reverse={previewDirection === 'vertical-reverse' ? true : false}
								/>
							)}
						</KadencePanelBody>
						<KadencePanelBody
							title={__('Content Size Settings', 'kadence-blocks')}
							panelName={'kb-header-size-settings'}
						>
							<ResponsiveRangeControls
								label={__('Min Height', 'kadence-blocks')}
								value={undefined !== height?.[0] ? parseFloat(height[0]) : ''}
								onChange={(value) => {
									setMetaAttribute(
										[
											value.toString(),
											undefined !== height?.[1] ? height[1] : '',
											undefined !== height?.[2] ? height[2] : '',
										],
										'height'
									);
								}}
								tabletValue={undefined !== height?.[1] ? parseFloat(height[1]) : ''}
								onChangeTablet={(value) => {
									setMetaAttribute(
										[
											undefined !== height?.[0] ? height[0] : '',
											value.toString(),
											undefined !== height?.[2] ? height[2] : '',
										],
										'height'
									);
								}}
								mobileValue={undefined !== height?.[2] ? parseFloat(height[2]) : ''}
								onChangeMobile={(value) => {
									setMetaAttribute(
										[
											undefined !== height?.[0] ? height[0] : '',
											undefined !== height?.[1] ? height[1] : '',
											value.toString(),
										],
										'height'
									);
								}}
								min={0}
								max={heightUnit === 'px' ? 2000 : 200}
								step={1}
								unit={heightUnit ? heightUnit : 'px'}
								onUnit={(value) => {
									setMetaAttribute(value, 'heightUnit');
								}}
								units={['px', 'vh', 'vw']}
							/>
							<ResponsiveRangeControls
								label={__('Max Width', 'kadence-blocks')}
								value={undefined !== width?.[0] ? parseFloat(width[0]) : ''}
								onChange={(value) => {
									setMetaAttribute(
										[
											value.toString(),
											undefined !== width?.[1] ? width[1] : '',
											undefined !== width?.[2] ? width[2] : '',
										],
										'width'
									);
								}}
								tabletValue={undefined !== width?.[1] ? parseFloat(width[1]) : ''}
								onChangeTablet={(value) => {
									setMetaAttribute(
										[
											undefined !== width?.[0] ? width[0] : '',
											value.toString(),
											undefined !== width?.[2] ? width[2] : '',
										],
										'width'
									);
								}}
								mobileValue={undefined !== width?.[2] ? parseFloat(width[2]) : ''}
								onChangeMobile={(value) => {
									setMetaAttribute(
										[
											undefined !== width?.[0] ? width[0] : '',
											undefined !== width?.[1] ? width[1] : '',
											value.toString(),
										],
										'width'
									);
								}}
								min={0}
								max={widthUnit === 'px' ? 2000 : 200}
								step={1}
								unit={widthUnit ? widthUnit : 'px'}
								onUnit={(value) => {
									setMetaAttribute(value, 'widthUnit');
								}}
								units={['px', '%', 'vw']}
							/>
						</KadencePanelBody>
					</>
				)}

				{activeTab === 'style' && (
					<>
						{previewIsTransparent != '1' && (
							<KadencePanelBody
								title={__('Background Settings', 'kadence-blocks')}
								initialOpen={true}
								panelName={'kb-header-bg-settings'}
							>
								{backgroundStyleControls()}
							</KadencePanelBody>
						)}
						{previewIsTransparent == '1' && (
							<KadencePanelBody
								title={__('Transparent Background Settings', 'kadence-blocks')}
								initialOpen={false}
								panelName={'kb-header-bg-transparent-settings'}
							>
								{backgroundStyleControls('', 'Transparent')}
							</KadencePanelBody>
						)}
						{previewIsSticky == '1' && (
							<KadencePanelBody
								title={__('Sticky Background Settings', 'kadence-blocks')}
								initialOpen={false}
								panelName={'kb-header-bg-styicky-settings'}
							>
								{backgroundStyleControls('', 'Sticky')}
							</KadencePanelBody>
						)}
						<KadencePanelBody
							title={__('Border Settings', 'kadence-blocks')}
							initialOpen={false}
							panelName={'kb-header-border'}
						>
							<HoverToggleControl
								normal={
									<>
										<ResponsiveBorderControl
											label={__('Border', 'kadence-blocks')}
											value={border}
											tabletValue={borderTablet}
											mobileValue={borderMobile}
											onChange={(value) => {
												setMetaAttribute(value, 'border');
											}}
											onChangeTablet={(value) => setMetaAttribute(value, 'borderTablet')}
											onChangeMobile={(value) => setMetaAttribute(value, 'borderMobile')}
										/>
										<ResponsiveMeasurementControls
											label={__('Border Radius', 'kadence-blocks')}
											value={borderRadius}
											tabletValue={borderRadiusTablet}
											mobileValue={borderRadiusMobile}
											onChange={(value) => setMetaAttribute(value, 'borderRadius')}
											onChangeTablet={(value) => setMetaAttribute(value, 'borderRadiusTablet')}
											onChangeMobile={(value) => setMetaAttribute(value, 'borderRadiusMobile')}
											unit={borderRadiusUnit}
											units={['px', 'em', 'rem', '%']}
											onUnit={(value) => setMetaAttribute(value, 'borderRadiusUnit')}
											max={borderRadiusUnit === 'em' || borderRadiusUnit === 'rem' ? 24 : 500}
											step={borderRadiusUnit === 'em' || borderRadiusUnit === 'rem' ? 0.1 : 1}
											min={0}
											isBorderRadius={true}
											allowEmpty={true}
										/>
									</>
								}
								hover={
									<>
										<ResponsiveBorderControl
											label={__('Hover Border', 'kadence-blocks')}
											value={borderHover}
											tabletValue={borderHoverTablet}
											mobileValue={borderHoverMobile}
											onChange={(value) => {
												setMetaAttribute(value, 'borderHover');
											}}
											onChangeTablet={(value) => setMetaAttribute(value, 'borderHoverTablet')}
											onChangeMobile={(value) => setMetaAttribute(value, 'borderHoverMobile')}
										/>
										<ResponsiveMeasurementControls
											label={__('Border Radius', 'kadence-blocks')}
											value={borderRadiusHover}
											tabletValue={borderRadiusHoverTablet}
											mobileValue={borderRadiusHoverMobile}
											onChange={(value) => setMetaAttribute(value, 'borderRadiusHover')}
											onChangeTablet={(value) =>
												setMetaAttribute(value, 'borderRadiusHoverTablet')
											}
											onChangeMobile={(value) =>
												setMetaAttribute(value, 'borderRadiusHoverMobile')
											}
											unit={borderRadiusHoverUnit}
											units={['px', 'em', 'rem', '%']}
											onUnit={(value) => setMetaAttribute(value, 'borderRadiusHoverUnit')}
											max={
												borderRadiusHoverUnit === 'em' || borderRadiusHoverUnit === 'rem'
													? 24
													: 500
											}
											step={
												borderRadiusHoverUnit === 'em' || borderRadiusHoverUnit === 'rem'
													? 0.1
													: 1
											}
											min={0}
											isBorderRadius={true}
											allowEmpty={true}
										/>
									</>
								}
							/>
						</KadencePanelBody>
						{previewIsTransparent == '1' && (
							<KadencePanelBody
								title={__('Transparent Border Settings', 'kadence-blocks')}
								initialOpen={false}
								panelName={'kb-header-border-transparent'}
							>
								<HoverToggleControl
									normal={
										<>
											<ResponsiveBorderControl
												label={__('Border', 'kadence-blocks')}
												value={borderTransparent}
												tabletValue={borderTransparentTablet}
												mobileValue={borderTransparentMobile}
												onChange={(value) => {
													setMetaAttribute(value, 'borderTransparent');
												}}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderTransparentTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderTransparentMobile')
												}
											/>
											<ResponsiveMeasurementControls
												label={__('Border Radius', 'kadence-blocks')}
												value={borderRadiusTransparent}
												tabletValue={borderRadiusTransparentTablet}
												mobileValue={borderRadiusTransparentMobile}
												onChange={(value) => setMetaAttribute(value, 'borderRadiusTransparent')}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentMobile')
												}
												unit={borderRadiusTransparentUnit}
												units={['px', 'em', 'rem', '%']}
												onUnit={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentUnit')
												}
												max={
													borderRadiusTransparentUnit === 'em' ||
													borderRadiusTransparentUnit === 'rem'
														? 24
														: 500
												}
												step={
													borderRadiusTransparentUnit === 'em' ||
													borderRadiusTransparentUnit === 'rem'
														? 0.1
														: 1
												}
												min={0}
												isBorderRadius={true}
												allowEmpty={true}
											/>
										</>
									}
									hover={
										<>
											<ResponsiveBorderControl
												label={__('Hover Border', 'kadence-blocks')}
												value={borderTransparentHover}
												tabletValue={borderTransparentHoverTablet}
												mobileValue={borderTransparentHoverMobile}
												onChange={(value) => {
													setMetaAttribute(value, 'borderTransparentHover');
												}}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderTransparentHoverTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderTransparentHoverMobile')
												}
											/>
											<ResponsiveMeasurementControls
												label={__('Border Radius', 'kadence-blocks')}
												value={borderRadiusTransparentHover}
												tabletValue={borderRadiusTransparentHoverTablet}
												mobileValue={borderRadiusTransparentHoverMobile}
												onChange={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentHover')
												}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentHoverTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentHoverMobile')
												}
												unit={borderRadiusTransparentHoverUnit}
												units={['px', 'em', 'rem', '%']}
												onUnit={(value) =>
													setMetaAttribute(value, 'borderRadiusTransparentHoverUnit')
												}
												max={
													borderRadiusTransparentHoverUnit === 'em' ||
													borderRadiusTransparentHoverUnit === 'rem'
														? 24
														: 500
												}
												step={
													borderRadiusTransparentHoverUnit === 'em' ||
													borderRadiusTransparentHoverUnit === 'rem'
														? 0.1
														: 1
												}
												min={0}
												isBorderRadius={true}
												allowEmpty={true}
											/>
										</>
									}
								/>
							</KadencePanelBody>
						)}
						{previewIsSticky == '1' && (
							<KadencePanelBody
								title={__('Sticky Border Settings', 'kadence-blocks')}
								initialOpen={false}
								panelName={'kb-header-border-sticky'}
							>
								<HoverToggleControl
									normal={
										<>
											<ResponsiveBorderControl
												label={__('Border', 'kadence-blocks')}
												value={borderSticky}
												tabletValue={borderStickyTablet}
												mobileValue={borderStickyMobile}
												onChange={(value) => {
													setMetaAttribute(value, 'borderSticky');
												}}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderStickyTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderStickyMobile')
												}
											/>
											<ResponsiveMeasurementControls
												label={__('Border Radius', 'kadence-blocks')}
												value={borderRadiusSticky}
												tabletValue={borderRadiusStickyTablet}
												mobileValue={borderRadiusStickyMobile}
												onChange={(value) => setMetaAttribute(value, 'borderRadiusSticky')}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderRadiusStickyTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderRadiusStickyMobile')
												}
												unit={borderRadiusStickyUnit}
												units={['px', 'em', 'rem', '%']}
												onUnit={(value) => setMetaAttribute(value, 'borderRadiusStickyUnit')}
												max={
													borderRadiusStickyUnit === 'em' || borderRadiusStickyUnit === 'rem'
														? 24
														: 500
												}
												step={
													borderRadiusStickyUnit === 'em' || borderRadiusStickyUnit === 'rem'
														? 0.1
														: 1
												}
												min={0}
												isBorderRadius={true}
												allowEmpty={true}
											/>
										</>
									}
									hover={
										<>
											<ResponsiveBorderControl
												label={__('Hover Border', 'kadence-blocks')}
												value={borderStickyHover}
												tabletValue={borderStickyHoverTablet}
												mobileValue={borderStickyHoverMobile}
												onChange={(value) => {
													setMetaAttribute(value, 'borderStickyHover');
												}}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderStickyHoverTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderStickyHoverMobile')
												}
											/>
											<ResponsiveMeasurementControls
												label={__('Border Radius', 'kadence-blocks')}
												value={borderRadiusStickyHover}
												tabletValue={borderRadiusStickyHoverTablet}
												mobileValue={borderRadiusStickyHoverMobile}
												onChange={(value) => setMetaAttribute(value, 'borderRadiusStickyHover')}
												onChangeTablet={(value) =>
													setMetaAttribute(value, 'borderRadiusStickyHoverTablet')
												}
												onChangeMobile={(value) =>
													setMetaAttribute(value, 'borderRadiusStickyHoverMobile')
												}
												unit={borderRadiusStickyHoverUnit}
												units={['px', 'em', 'rem', '%']}
												onUnit={(value) =>
													setMetaAttribute(value, 'borderRadiusStickyHoverUnit')
												}
												max={
													borderRadiusStickyHoverUnit === 'em' ||
													borderRadiusStickyHoverUnit === 'rem'
														? 24
														: 500
												}
												step={
													borderRadiusStickyHoverUnit === 'em' ||
													borderRadiusStickyHoverUnit === 'rem'
														? 0.1
														: 1
												}
												min={0}
												isBorderRadius={true}
												allowEmpty={true}
											/>
										</>
									}
								/>
							</KadencePanelBody>
						)}
						<KadencePanelBody
							title={__('Typography Settings', 'kadence-blocks')}
							initialOpen={false}
							panelName={'kb-header-font-family'}
						>
							<TypographyControls
								fontGroup={'header'}
								fontSize={typography.size}
								onFontSize={(value) => setMetaAttribute({ ...typography, size: value }, 'typography')}
								fontSizeType={typography.sizeType}
								onFontSizeType={(value) =>
									setMetaAttribute({ ...typography, sizeType: value }, 'typography')
								}
								lineHeight={typography.lineHeight}
								onLineHeight={(value) =>
									setMetaAttribute({ ...typography, lineHeight: value }, 'typography')
								}
								lineHeightType={typography.lineType}
								onLineHeightType={(value) =>
									setMetaAttribute({ ...typography, lineType: value }, 'typography')
								}
								reLetterSpacing={typography.letterSpacing}
								onLetterSpacing={(value) =>
									setMetaAttribute({ ...typography, letterSpacing: value }, 'typography')
								}
								letterSpacingType={typography.letterType}
								onLetterSpacingType={(value) =>
									setMetaAttribute({ ...typography, letterType: value }, 'typography')
								}
								textTransform={typography.textTransform}
								onTextTransform={(value) =>
									setMetaAttribute({ ...typography, textTransform: value }, 'typography')
								}
								fontFamily={typography.family}
								onFontFamily={(value) =>
									setMetaAttribute({ ...typography, family: value }, 'typography')
								}
								onFontChange={(select) => {
									setMetaAttribute({ ...typography, ...select }, 'typography');
								}}
								onFontArrayChange={(values) =>
									setMetaAttribute({ ...typography, ...values }, 'typography')
								}
								googleFont={typography.google}
								onGoogleFont={(value) =>
									setMetaAttribute({ ...typography, google: value }, 'typography')
								}
								loadGoogleFont={typography.loadGoogle}
								onLoadGoogleFont={(value) =>
									setMetaAttribute({ ...typography, loadGoogle: value }, 'typography')
								}
								fontVariant={typography.variant}
								onFontVariant={(value) =>
									setMetaAttribute({ ...typography, variant: value }, 'typography')
								}
								fontWeight={typography.weight}
								onFontWeight={(value) =>
									setMetaAttribute({ ...typography, weight: value }, 'typography')
								}
								fontStyle={typography.style}
								onFontStyle={(value) => setMetaAttribute({ ...typography, style: value }, 'typography')}
								fontSubset={typography.subset}
								onFontSubset={(value) =>
									setMetaAttribute({ ...typography, subset: value }, 'typography')
								}
							/>
						</KadencePanelBody>
						<KadencePanelBody
							title={__('Text Color Settings', 'kadence-blocks')}
							initialOpen={false}
							panelName={'kb-header-text-color'}
						>
							<ColorGroup>
								<PopColorControl
									label={__('Text Color', 'kadence-blocks')}
									value={typography.color ? typography.color : ''}
									default={''}
									onChange={(value) =>
										setMetaAttribute({ ...typography, color: value }, 'typography')
									}
								/>
								<PopColorControl
									label={__('Link Color', 'kadence-blocks')}
									value={linkColor ? linkColor : ''}
									default={''}
									onChange={(value) => setMetaAttribute(value, 'linkColor')}
									swatchLabel2={__('Hover Color', 'kadence-blocks')}
									value2={linkHoverColor ? linkHoverColor : ''}
									default2={''}
									onChange2={(value) => setMetaAttribute(value, 'linkHoverColor')}
								/>
							</ColorGroup>
						</KadencePanelBody>
						<div className="kt-sidebar-settings-spacer"></div>
					</>
				)}

				{activeTab === 'advanced' && (
					<>
						<KadencePanelBody panelName={'kb-header-padding'}>
							<ResponsiveMeasureRangeControl
								label={__('Padding', 'kadence-blocks')}
								value={arrayStringToInt(padding)}
								tabletValue={arrayStringToInt(tabletPadding)}
								mobileValue={arrayStringToInt(mobilePadding)}
								onChange={(value) => {
									setMetaAttribute(value.map(String), 'padding');
								}}
								onChangeTablet={(value) => {
									setMetaAttribute(value.map(String), 'tabletPadding');
								}}
								onChangeMobile={(value) => {
									setMetaAttribute(value.map(String), 'mobilePadding');
								}}
								min={0}
								max={paddingUnit === 'em' || paddingUnit === 'rem' ? 24 : 200}
								step={paddingUnit === 'em' || paddingUnit === 'rem' ? 0.1 : 1}
								unit={paddingUnit}
								units={['px', 'em', 'rem', '%']}
								onUnit={(value) => setMetaAttribute(value, 'paddingUnit')}
								onMouseOver={paddingMouseOver.onMouseOver}
								onMouseOut={paddingMouseOver.onMouseOut}
							/>
							<ResponsiveMeasureRangeControl
								label={__('Margin', 'kadence-blocks')}
								value={arrayStringToInt(margin)}
								tabletValue={arrayStringToInt(tabletMargin)}
								mobileValue={arrayStringToInt(mobileMargin)}
								onChange={(value) => {
									setMetaAttribute(value.map(String), 'margin');
								}}
								onChangeTablet={(value) => {
									setMetaAttribute(value.map(String), 'tabletMargin');
								}}
								onChangeMobile={(value) => {
									setMetaAttribute(value.map(String), 'mobileMargin');
								}}
								min={marginUnit === 'em' || marginUnit === 'rem' ? -12 : -200}
								max={marginUnit === 'em' || marginUnit === 'rem' ? 24 : 200}
								step={marginUnit === 'em' || marginUnit === 'rem' ? 0.1 : 1}
								unit={marginUnit}
								units={['px', 'em', 'rem', '%', 'vh']}
								onUnit={(value) => setMetaAttribute(value, 'marginUnit')}
								onMouseOver={marginMouseOver.onMouseOver}
								onMouseOut={marginMouseOver.onMouseOut}
								allowAuto={true}
							/>
						</KadencePanelBody>
					</>
				)}
			</InspectorControls>
			<InspectorAdvancedControls>
				<TextControl
					__nextHasNoMarginBottom
					className="html-anchor-control"
					label={__('HTML anchor')}
					help={
						<>
							{__(
								'Enter a word or two — without spaces — to make a unique web address just for this block, called an “anchor.” Then, you’ll be able to link directly to this section of your page.'
							)}

							<ExternalLink href={__('https://wordpress.org/documentation/article/page-jumps/')}>
								{__('Learn more about anchors')}
							</ExternalLink>
						</>
					}
					value={anchor}
					placeholder={__('Add an anchor')}
					onChange={(nextValue) => {
						nextValue = nextValue.replace(ANCHOR_REGEX, '-');
						setMetaAttribute(nextValue, 'anchor');
					}}
					autoCapitalize="none"
					autoComplete="off"
				/>

				<TextControl
					__nextHasNoMarginBottom
					autoComplete="off"
					label={__('Additional CSS class(es)')}
					value={className}
					onChange={(nextValue) => {
						setMetaAttribute(nextValue !== '' ? nextValue : undefined, 'className');
					}}
					help={__('Separate multiple classes with spaces.')}
				/>
			</InspectorAdvancedControls>
			<BlockContextProvider
				value={{
					'kadence/headerPostId': id,
					'kadence/headerIsSticky': previewIsSticky,
					'kadence/headerIsTransparent': previewIsTransparent,
				}}
			>
				<Fragment {...innerBlocksProps} />
			</BlockContextProvider>
			<span className="height-ref" ref={componentRef} />
			{/*<SpacingVisualizer*/}
			{/*	style={ {*/}
			{/*		marginLeft: ( undefined !== previewMarginLeft ? getSpacingOptionOutput( previewMarginLeft, marginUnit ) : undefined ),*/}
			{/*		marginRight: ( undefined !== previewMarginRight ? getSpacingOptionOutput( previewMarginRight, marginUnit ) : undefined ),*/}
			{/*		marginTop: ( undefined !== previewMarginTop ? getSpacingOptionOutput( previewMarginTop, marginUnit ) : undefined ),*/}
			{/*		marginBottom: ( undefined !== previewMarginBottom ? getSpacingOptionOutput( previewMarginBottom, marginUnit ) : undefined ),*/}
			{/*	} }*/}
			{/*	type="inside"*/}
			{/*	forceShow={ paddingMouseOver.isMouseOver }*/}
			{/*	spacing={ [ getSpacingOptionOutput( previewPaddingTop, paddingUnit ), getSpacingOptionOutput( previewPaddingRight, paddingUnit ), getSpacingOptionOutput( previewPaddingBottom, paddingUnit ), getSpacingOptionOutput( previewPaddingLeft, paddingUnit ) ] }*/}
			{/*/>*/}
			{/*<SpacingVisualizer*/}
			{/*	type="inside"*/}
			{/*	forceShow={ marginMouseOver.isMouseOver }*/}
			{/*	spacing={ [ getSpacingOptionOutput( previewMarginTop, marginUnit ), getSpacingOptionOutput( previewMarginRight, marginUnit ), getSpacingOptionOutput( previewMarginBottom, marginUnit ), getSpacingOptionOutput( previewMarginLeft, marginUnit ) ] }*/}
			{/*/>*/}
		</>
	);
}

export default EditInner;

function useHeaderProp(prop) {
	return useEntityProp('postType', 'kadence_header', prop);
}
