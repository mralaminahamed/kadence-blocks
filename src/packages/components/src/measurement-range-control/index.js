/**
 * Range Control
 *
 */
/**
 * WordPress dependencies
 */
 import { useInstanceId } from '@wordpress/compose';
 import { useState, useEffect } from '@wordpress/element';
 import SingleMeasureRangeControl from './single-control'
/**
 * Import Css
 */
import './editor.scss';
/**
 * Internal block libraries
 */
 import { __ } from '@wordpress/i18n';
import {
	Flex,
	FlexBlock,
	FlexItem,
	Button,
	DropdownMenu,
	ButtonGroup,
	RangeControl as CoreRangeControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';
import {
	pxIcon,
	emIcon,
	remIcon,
	vhIcon,
	vwIcon,
	percentIcon,
	outlineTopIcon,
	outlineRightIcon,
	outlineBottomIcon,
	outlineLeftIcon,
	individualIcon,
	linkedIcon,
	topLeftIcon,
	topRightIcon,
	bottomRightIcon,
	bottomLeftIcon,
	radiusLinkedIcon,
	radiusIndividualIcon
} from '@kadence/icons';
import { settings, link, linkOff } from '@wordpress/icons';
import { OPTIONS_MAP } from './constants';
import { isCustomOption, getOptionIndex, getOptionFromSize, getOptionSize } from './utils';

let icons = {
	px: pxIcon,
	em: emIcon,
	rem: remIcon,
	vh: vhIcon,
	vw: vwIcon,
	percent: percentIcon,
};
/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
export default function MeasureRangeControl( {
	label,
	onChange,
	onControl,
	value = '',
	className = '',
	options = OPTIONS_MAP,
	step = 1,
	max = 200,
	min = 0,
	beforeIcon = '',
	help = '',
	defaultValue = 0,
	control = 'individual',
	unit = '',
	onUnit,
	units = [ 'px', 'em', 'rem' ],
	disableCustomSizes = false,
	isBorderRadius= false,
	firstIcon = outlineTopIcon,
	secondIcon = outlineRightIcon,
	thirdIcon = outlineBottomIcon,
	fourthIcon = outlineLeftIcon,
	linkIcon = link,
	unlinkIcon = linkOff,
	customControl = false,
	setCustomControl = null,
	reset,
} ) {
	const measureIcons = {
		first: isBorderRadius ? topLeftIcon : firstIcon,
		second: isBorderRadius ? topRightIcon : secondIcon,
		third: isBorderRadius ? bottomRightIcon : thirdIcon,
		fourth: isBorderRadius ? bottomLeftIcon : fourthIcon,
		link: isBorderRadius ? radiusLinkedIcon : linkIcon,
		unlink: isBorderRadius ? radiusIndividualIcon : unlinkIcon,
	}
	const [ isCustom, setIsCustom ] = useState( false );
	const [ theControl, setTheControl ] = useState( control );
	useEffect( () => {
		setIsCustom( isCustomOption( options, value ) );
	}, [] );
	const realIsCustomControl = setCustomControl ? customControl : isCustom;
	const realSetIsCustom = setCustomControl ? setCustomControl : setIsCustom;
	const onReset = () => {
		if ( typeof reset === 'function' ){
			reset();
		} else {
			onChange( [ '', '', '', '' ] );
		}
	}
	const onSetIsCustom = () => {
		if ( ! realIsCustomControl ) {
			const newValue = [
				getOptionSize( options, ( value ? value[ 0 ] : '' ), unit ),
				getOptionSize( options, ( value ? value[ 1 ] : '' ), unit ),
				getOptionSize( options, ( value ? value[ 2 ] : '' ), unit ),
				getOptionSize( options, ( value ? value[ 3 ] : '' ), unit ),
			];
			onChange( newValue );
		} else {
			const newValue = [
				getOptionFromSize( options, ( value ? value[ 0 ] : '' ), unit ),
				getOptionFromSize( options, ( value ? value[ 1 ] : '' ), unit ),
				getOptionFromSize( options, ( value ? value[ 2 ] : '' ), unit ),
				getOptionFromSize( options, ( value ? value[ 3 ] : '' ), unit ),
			];
			onChange( newValue );
		}
		realSetIsCustom( ! realIsCustomControl );
	}
	const realControl = onControl ? control : theControl;
	const realSetOnControl = onControl ? onControl : setTheControl;
	return [
		onChange && (
			<div className={ `components-base-control component-spacing-sizes-control kadence-measure-range-control ${ className ? ' ' + className : '' }` }>
				{ label && (
					<Flex
						justify="space-between"
						className={ 'kadence-radio-range__header' }
					>
						<FlexItem>
							<label className="components-base-control__label">{ label }</label>
						</FlexItem>
						{ ! disableCustomSizes && (
							<Button
								className={'kadence-radio-item radio-custom only-icon'}
								label={ ! realIsCustomControl ? __( 'Set custom size', 'kadence-blocks' ) : __( 'Use size preset', 'kadence-blocks' )  }
								icon={ settings }
								isSmall={ true }
								onClick={ onSetIsCustom }
								isPressed={ realIsCustomControl ? true : false }
								isTertiary={ realIsCustomControl ? false : true }
							/>
						) }
						{ realSetOnControl && (
							<Button
								isSmall={ true }
								className={'kadence-radio-item radio-custom is-single only-icon'}
								label={ realControl !== 'individual' ? __( 'Individual', 'kadence-blocks' ) : __( 'Linked', 'kadence-blocks' )  }
								icon={ realControl !== 'individual' ? measureIcons.link : measureIcons.unlink }
								onClick={ () => realSetOnControl( realControl !== 'individual' ? 'individual' : 'linked' ) }
								isPressed={ realControl !== 'individual' ? true : false }
								isTertiary={ realControl !== 'individual' ? false : true }
							/>
						) }
					</Flex>
				) }
				<div className={ 'kadence-controls-content' }>
					{ realControl !== 'individual' && (
						<>
							<SingleMeasureRangeControl
								value={ ( value ? value[ 0 ] : '' ) }
								onChange={ ( newVal ) => onChange( [ newVal, newVal, newVal, newVal ] ) }
								min={ min }
								max={ max }
								options={ options }
								step={ step }
								help={ help }
								unit={ unit }
								units={ units }
								onUnit={ onUnit }
								defaultValue={ defaultValue }
								allowReset={ false }
								disableCustomSizes={ true }
								setCustomControl={ realSetIsCustom }
								customControl={ realIsCustomControl }
								isPopover={ false }
								isSingle={ true }
							/>
						</>
					) }
					{ realControl === 'individual' && (
						<>
							<SingleMeasureRangeControl
								parentLabel={ label }
								label={ __( 'Top', 'kadence-blocks' ) }
								className={ 'kb-measure-box-top' }
								value={ ( value ? value[ 0 ] : '' ) }
								onChange={ ( newVal ) => onChange( [ newVal, ( value && undefined !== value[ 1 ] ? value[ 1 ] : '' ), ( value && undefined !== value[ 2 ] ? value[ 2 ] : '' ), ( value && undefined !== value[ 3 ] ? value[ 3 ] : '' ) ] ) }
								min={ min }
								max={ max }
								options={ options }
								step={ step }
								help={ help }
								unit={ unit }
								units={ units }
								onUnit={ onUnit }
								defaultValue={ defaultValue }
								allowReset={ false }
								disableCustomSizes={ true }
								setCustomControl={ realSetIsCustom }
								customControl={ realIsCustomControl }
								isPopover={ true }
							/>
							<SingleMeasureRangeControl
								parentLabel={ label }
								label={ __( 'Right', 'kadence-blocks' ) }
								className={ 'kb-measure-box-right' }
								value={ ( value ? value[ 1 ] : '' ) }
								onChange={ ( newVal ) => onChange( [ ( value && undefined !== value[ 0 ] ? value[ 0 ] : '' ), newVal, ( value && undefined !== value[ 2 ] ? value[ 2 ] : '' ), ( value && undefined !== value[ 3 ] ? value[ 3 ] : '' ) ] ) }
								min={ min }
								max={ max }
								options={ options }
								step={ step }
								help={ help }
								unit={ unit }
								units={ units }
								onUnit={ onUnit }
								defaultValue={ defaultValue }
								allowReset={ false }
								disableCustomSizes={ true }
								setCustomControl={ realSetIsCustom }
								customControl={ realIsCustomControl }
								isPopover={ true }
							/>
							<SingleMeasureRangeControl
								parentLabel={ label }
								label={ __( 'Bottom', 'kadence-blocks' ) }
								className={ 'kb-measure-box-bottom' }
								value={ ( value ? value[ 2 ] : '' ) }
								onChange={ ( newVal ) => onChange( [ ( value && undefined !== value[ 0 ] ? value[ 0 ] : '' ), ( value && undefined !== value[ 1 ] ? value[ 1 ] : '' ), newVal, ( value && undefined !== value[ 3 ] ? value[ 3 ] : '' ) ] ) }
								min={ min }
								max={ max }
								options={ options }
								step={ step }
								help={ help }
								unit={ unit }
								units={ units }
								onUnit={ onUnit }
								defaultValue={ defaultValue }
								allowReset={ false }
								disableCustomSizes={ true }
								setCustomControl={ realSetIsCustom }
								customControl={ realIsCustomControl }
								isPopover={ true }
							/>
							<SingleMeasureRangeControl
								parentLabel={ label }
								label={ __( 'Left', 'kadence-blocks' ) }
								className={ 'kb-measure-box-left' }
								value={ ( value ? value[ 3 ] : '' ) }
								onChange={ ( newVal ) => onChange( [ ( value && undefined !== value[ 0 ] ? value[ 0 ] : '' ), ( value && undefined !== value[ 1 ] ? value[ 1 ] : '' ), ( value && undefined !== value[ 2 ] ? value[ 2 ] : '' ), newVal ] ) }
								min={ min }
								max={ max }
								options={ options }
								step={ step }
								help={ help }
								unit={ unit }
								units={ units }
								onUnit={ onUnit }
								defaultValue={ defaultValue }
								allowReset={ false }
								disableCustomSizes={ true }
								setCustomControl={ realSetIsCustom }
								customControl={ realIsCustomControl }
								isPopover={ true }
							/>
							{ realIsCustomControl && (
								<div className={ 'kadence-measure-control-select-wrapper' }>
									<select
										className={ 'kadence-measure-control-select components-unit-control__select' }
										onChange={ onUnit }
										value={ unit }
									>
										{ units.map( ( option ) => (
											<option value={ option } key={ option }>
												{ option }
											</option>
										) ) }
									</select>
								</div>
							) }
						</>
					) }
				</div>
			</div>
		),
	];
}
