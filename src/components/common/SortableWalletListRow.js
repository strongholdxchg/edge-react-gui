/* eslint-disable flowtype/require-valid-file-annotation */

import { bns } from 'biggystring'
import React, { Component } from 'react'
import { ActivityIndicator, Image, Platform, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'

import sort from '../../assets/images/walletlist/sort.png'
import { intl } from '../../locales/intl'
import s from '../../locales/strings.js'
import * as SETTINGS_SELECTORS from '../../modules/Settings/selectors'
import T from '../../modules/UI/components/FormattedText/index'
import styles, { styles as styleRaw } from '../../styles/scenes/WalletListStyle.js'
import { cutOffText, decimalOrZero, findDenominationSymbol, truncateDecimals } from '../../util/utils'

const DIVIDE_PRECISION = 18

class SortableWalletListRow extends Component<Props, State> {
  render () {
    const { data } = this.props
    const walletData = data
    let multiplier, name, symbol, cryptoCurrencyName, symbolImageDarkMono, preliminaryCryptoAmount, finalCryptoAmount

    // const exchangeDenomination = SETTINGS_SELECTORS.getExchangeDenomination(state, data.currencyCode)
    if (walletData.currencyCode) {
      // if wallet is done loading
      const displayDenomination = SETTINGS_SELECTORS.getDisplayDenominationFromSettings(this.props.settings, walletData.currencyCode)
      multiplier = displayDenomination.multiplier
      name = walletData.name || s.strings.string_no_name
      symbol = findDenominationSymbol(walletData.denominations, walletData.currencyCode)
      cryptoCurrencyName = walletData.currencyNames[walletData.currencyCode]
      symbolImageDarkMono = walletData.symbolImageDarkMono
      preliminaryCryptoAmount = truncateDecimals(bns.div(walletData.primaryNativeBalance, multiplier, DIVIDE_PRECISION), 6)
      finalCryptoAmount = intl.formatNumberInput(decimalOrZero(preliminaryCryptoAmount, 6)) // make it show zero if infinitesimal number
    }
    return (
      <TouchableHighlight
        style={[styles.rowContainer, styles.sortableWalletListRow]}
        underlayColor={styleRaw.walletRowUnderlay.color}
        {...this.props.sortHandlers}
      >
        {walletData.currencyCode ? (
          <View style={[styles.rowContent, styles.sortableRowContent]}>
            <View style={[styles.rowDragArea]}>
              <Image source={sort} style={{ height: 15, width: 15 }} />
            </View>
            <View style={[styles.rowNameTextWrap]}>
              {Platform.OS === 'ios' && (
                <View style={[styles.rowNameTextWrapIOS]}>
                  <T style={[styles.rowNameText]} numberOfLines={1}>
                    {symbolImageDarkMono && <Image style={[styles.rowCurrencyLogoIOS]} transform={[{ translateY: 3 }]} source={{ uri: symbolImageDarkMono }} />}{' '}
                    {cutOffText(name, 34)}
                  </T>
                </View>
              )}
              {Platform.OS === 'android' && (
                <View style={[styles.rowNameTextWrapAndroid]}>
                  {symbolImageDarkMono && <Image style={[styles.rowCurrencyLogoAndroid]} source={{ uri: symbolImageDarkMono }} />}
                  <T style={[styles.rowNameText]} numberOfLines={1}>
                    {cutOffText(name, 34)}
                  </T>
                </View>
              )}
            </View>
            <View style={[styles.rowBalanceTextWrap]}>
              <T style={[styles.rowBalanceAmountText]}>{finalCryptoAmount}</T>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <T style={[styles.rowBalanceDenominationText]}>{cryptoCurrencyName}</T>
                <T> (</T>
                <T style={[styles.rowBalanceDenominationText, styles.symbol]}>{symbol || ''}</T>
                <T>)</T>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.rowContent]}>
            <View style={[styles.rowNameTextWrap]}>
              <ActivityIndicator style={{ height: 18, width: 18 }} />
            </View>
          </View>
        )}
      </TouchableHighlight>
    )
  }
}

export default connect(state => {
  const settings = state.ui.settings

  return {
    settings
  }
})(SortableWalletListRow)
