// @flow

import { makeReactNativeFolder } from 'disklet'
import { ModalManager } from 'edge-components'
import type { DiskletFolder, EdgeContext, EdgeCorePluginFactory, EdgeCurrencyPlugin } from 'edge-core-js'
import { rippleCurrencyPluginFactory, stellarCurrencyPluginFactory } from 'edge-currency-accountbased'
import {
  bitcoinCurrencyPluginFactory,
  bitcoincashCurrencyPluginFactory,
  bitcoingoldCurrencyPluginFactory,
  bitcoinsvCurrencyPluginFactory,
  dashCurrencyPluginFactory,
  digibyteCurrencyPluginFactory,
  feathercoinCurrencyPluginFactory,
  litecoinCurrencyPluginFactory,
  qtumCurrencyPluginFactory,
  ufoCurrencyPluginFactory,
  vertcoinCurrencyPluginFactory,
  zcoinCurrencyPluginFactory
} from 'edge-currency-bitcoin'
import { ethereumCurrencyPluginFactory } from 'edge-currency-ethereum'
import { moneroCurrencyPluginFactory } from 'edge-currency-monero'
import { coinbasePlugin, coincapPlugin, shapeshiftPlugin } from 'edge-exchange-plugins'
import React, { Component } from 'react'
import { Image, Keyboard, Linking, StatusBar, TouchableWithoutFeedback, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Locale from 'react-native-locale'
import { MenuProvider } from 'react-native-popup-menu'
import { Actions, Drawer, Modal, Overlay, Router, Scene, Stack, Tabs } from 'react-native-router-flux'
import slowlog from 'react-native-slowlog'
import SplashScreen from 'react-native-smart-splash-screen'
// $FlowFixMe
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator'
import { connect } from 'react-redux'
import * as URI from 'uri-js'

import ENV from '../../env.json'
import MenuIcon from '../assets/images/MenuButton/menu.png'
import exchangeIconSelected from '../assets/images/tabbar/exchange_selected.png'
import exchangeIcon from '../assets/images/tabbar/exchange.png'
import receiveIconSelected from '../assets/images/tabbar/receive_selected.png'
import receiveIcon from '../assets/images/tabbar/receive.png'
import scanIconSelected from '../assets/images/tabbar/scan_selected.png'
import scanIcon from '../assets/images/tabbar/scan.png'
import walletIconSelected from '../assets/images/tabbar/wallets_selected.png'
import walletIcon from '../assets/images/tabbar/wallets.png'
import ExchangeDropMenu from '../connectors/components/HeaderMenuExchangeConnector'
import RequestDropMenu from '../connectors/components/HeaderMenuRequestConnector'
import CurrencySettingsTitleConnector from '../connectors/CurrencySettingsTitleConnector.js'
import { ExchangeSettingsConnector } from '../connectors/ExchangeSettingsConnector.js'
import AddToken from '../connectors/scenes/AddTokenConnector.js'
import ChangeMiningFeeSendConfirmation from '../connectors/scenes/ChangeMiningFeeSendConfirmationConnector.ui'
import ChangePasswordConnector from '../connectors/scenes/ChangePasswordConnector.ui'
import ChangePinConnector from '../connectors/scenes/ChangePinConnector.ui'
import { CreateWalletReview } from '../connectors/scenes/CreateWalletReviewConnector'
import { CreateWalletSelectCrypto } from '../connectors/scenes/CreateWalletSelectCryptoConnector'
import { CreateWalletSelectFiat } from '../connectors/scenes/CreateWalletSelectFiatConnector'
import { CryptoExchangeQuoteConnector } from '../connectors/scenes/CryptoExchangeQuoteConnector.js'
import { CryptoExchangeSceneConnector as ExchangeConnector } from '../connectors/scenes/CryptoExchangeSceneConnector'
import CurrencySettings from '../connectors/scenes/CurrencySettingsConnector'
import DefaultFiatSettingConnector from '../connectors/scenes/DefaultFiatSettingConnector'
import EdgeLoginSceneConnector from '../connectors/scenes/EdgeLoginSceneConnector'
import EditToken from '../connectors/scenes/EditTokenConnector.js'
import LoginConnector from '../connectors/scenes/LoginConnector'
import ManageTokens from '../connectors/scenes/ManageTokensConnector.js'
import OtpSettingsSceneConnector from '../connectors/scenes/OtpSettingsSceneConnector.js'
import PasswordRecoveryConnector from '../connectors/scenes/PasswordRecoveryConnector.js'
import Request from '../connectors/scenes/RequestConnector.js'
import Scan from '../connectors/scenes/ScanConnector'
import SendConfirmation from '../connectors/scenes/SendConfirmationConnector.js'
import SettingsOverview from '../connectors/scenes/SettingsOverviewConnector'
import TransactionDetails from '../connectors/scenes/TransactionDetailsConnector.js'
import TransactionListConnector from '../connectors/scenes/TransactionListConnector'
import TransactionsExportSceneConnector from '../connectors/scenes/TransactionsExportSceneConnector'
import WalletList from '../connectors/scenes/WalletListConnector'
import SendConfirmationOptions from '../connectors/SendConfirmationOptionsConnector.js'
import SpendingLimitsConnector from '../connectors/SpendingLimitsConnector.js'
import * as Constants from '../constants/indexConstants'
import { scale } from '../lib/scaling.js'
import { setIntlLocale } from '../locales/intl'
import s, { selectLocale } from '../locales/strings.js'
import EdgeAccountCallbackManager from '../modules/Core/Account/EdgeAccountCallbackManager.js'
import * as CONTEXT_API from '../modules/Core/Context/api'
import EdgeContextCallbackManager from '../modules/Core/Context/EdgeContextCallbackManager.js'
import EdgeWalletsCallbackManager from '../modules/Core/Wallets/EdgeWalletsCallbackManager.js'
import PermissionsManager, { type Permission, PermissionStrings } from '../modules/PermissionsManager.js'
import AutoLogout from '../modules/UI/components/AutoLogout/AutoLogoutConnector'
import { ContactsLoaderConnecter as ContactsLoader } from '../modules/UI/components/ContactsLoader/indexContactsLoader.js'
import ControlPanel from '../modules/UI/components/ControlPanel/ControlPanelConnector'
import ErrorAlert from '../modules/UI/components/ErrorAlert/ErrorAlertConnector'
import T from '../modules/UI/components/FormattedText/index'
import BackButton from '../modules/UI/components/Header/Component/BackButton.ui'
import HelpButton from '../modules/UI/components/Header/Component/HelpButtonConnector'
import Header from '../modules/UI/components/Header/Header.ui'
import WalletName from '../modules/UI/components/Header/WalletName/WalletNameConnector.js'
import HelpModal from '../modules/UI/components/HelpModal/index'
import { LoadingScene } from '../modules/UI/components/Loading/LoadingScene.ui.js'
import { ifLoggedIn } from '../modules/UI/components/LoginStatus/LoginStatus.js'
import { PasswordRecoveryReminderModalConnector } from '../modules/UI/components/PasswordRecoveryReminderModal/PasswordRecoveryReminderModalConnector.js'
import { passwordReminderModalConnector as PasswordReminderModal } from '../modules/UI/components/PasswordReminderModal/indexPasswordReminderModal.js'
import TransactionAlert from '../modules/UI/components/TransactionAlert/TransactionAlertConnector'
import { PluginBuySell, PluginSpend, PluginView, renderPluginBackButton } from '../modules/UI/scenes/Plugins/index'
import { HwBackButtonHandler } from '../modules/UI/scenes/WalletList/components/HwBackButtonHandler/index'
import { styles } from '../styles/MainStyle.js'
import { makeCoreContext } from '../util/makeContext.js'
import { CreateWalletName } from './scenes/CreateWalletNameScene.js'
import { CryptoExchangeQuoteProcessingScreenComponent } from './scenes/CryptoExchangeQuoteProcessingScene.js'
import { OnBoardingComponent } from './scenes/OnBoardingScene.js'
import { TermsOfServiceComponent } from './scenes/TermsOfServiceScene.js'

const pluginFactories: Array<EdgeCorePluginFactory> = [
  // Exchanges:
  coinbasePlugin,
  shapeshiftPlugin,
  coincapPlugin,
  // Currencies:
  bitcoincashCurrencyPluginFactory,
  bitcoinsvCurrencyPluginFactory,
  bitcoinCurrencyPluginFactory,
  ethereumCurrencyPluginFactory,
  stellarCurrencyPluginFactory,
  rippleCurrencyPluginFactory,
  moneroCurrencyPluginFactory,
  dashCurrencyPluginFactory,
  litecoinCurrencyPluginFactory,
  // dogecoinCurrencyPluginFactory,
  qtumCurrencyPluginFactory,
  digibyteCurrencyPluginFactory,
  bitcoingoldCurrencyPluginFactory,
  vertcoinCurrencyPluginFactory,
  zcoinCurrencyPluginFactory,
  feathercoinCurrencyPluginFactory,
  ufoCurrencyPluginFactory
]

const localeInfo = Locale.constants() // should likely be moved to login system and inserted into Redux

const UTILITY_SERVER_FILE = 'utilityServer.json'
global.etherscanApiKey = ENV.ETHERSCAN_API_KEY

const RouterWithRedux = connect()(Router)

StatusBar.setBarStyle('light-content', true)

const tabBarIconFiles: { [tabName: string]: string } = {}
tabBarIconFiles[Constants.WALLET_LIST] = walletIcon
tabBarIconFiles[Constants.REQUEST] = receiveIcon
tabBarIconFiles[Constants.SCAN] = scanIcon
tabBarIconFiles[Constants.TRANSACTION_LIST] = exchangeIcon
tabBarIconFiles[Constants.EXCHANGE] = exchangeIcon

const tabBarIconFilesSelected: { [tabName: string]: string } = {}
tabBarIconFilesSelected[Constants.WALLET_LIST] = walletIconSelected
tabBarIconFilesSelected[Constants.REQUEST] = receiveIconSelected
tabBarIconFilesSelected[Constants.SCAN] = scanIconSelected
tabBarIconFilesSelected[Constants.TRANSACTION_LIST] = exchangeIconSelected
tabBarIconFilesSelected[Constants.EXCHANGE] = exchangeIconSelected

const TRANSACTION_DETAILS = s.strings.title_transaction_details
const WALLETS = s.strings.title_wallets
const CREATE_WALLET_SELECT_CRYPTO = s.strings.title_create_wallet_select_crypto
const CREATE_WALLET_SELECT_FIAT = s.strings.title_create_wallet_select_fiat
const CREATE_WALLET = s.strings.title_create_wallet
const TRANSACTIONS_EXPORT = s.strings.title_export_transactions
const REQUEST = s.strings.title_request
const SCAN = s.strings.title_scan
const EDGE_LOGIN = s.strings.title_edge_login
const EXCHANGE = s.strings.title_exchange
const CHANGE_MINING_FEE = s.strings.title_change_mining_fee
const BACK = s.strings.title_back
const MANAGE_TOKENS = s.strings.title_manage_tokens
const ADD_TOKEN = s.strings.title_add_token
const EDIT_TOKEN = s.strings.title_edit_token
const SETTINGS = s.strings.title_settings
const EXCHANGE_SETTINGS = s.strings.settings_exchange_settings
const CHANGE_PASSWORD = s.strings.title_change_password
const CHANGE_PIN = s.strings.title_change_pin
const SPENDING_LIMITS = s.strings.spending_limits
const PASSWORD_RECOVERY = s.strings.title_password_recovery
const OTP = s.strings.title_otp
const DEFAULT_FIAT = s.strings.title_default_fiat
const PLUGIN_BUYSELL = s.strings.title_plugin_buysell
const PLUGIN_SPEND = s.strings.title_plugin_spend
const TERMS_OF_SERVICE = s.strings.title_terms_of_service

type Props = {
  requestPermission: (permission: Permission) => void,
  username?: string,
  addCurrencyPlugin: EdgeCurrencyPlugin => void,
  setKeyboardHeight: number => void,
  addContext: (EdgeContext, DiskletFolder) => void,
  addUsernames: (Array<string>) => void,
  setDeviceDimensions: any => void,
  dispatchEnableScan: () => void,
  dispatchDisableScan: () => void,
  urlReceived: string => void,
  updateCurrentSceneKey: string => void,
  showReEnableOtpModal: () => void,
  checkEnabledExchanges: () => void,
  openDrawer: () => void
}
type State = {
  context: ?EdgeContext
}

async function queryUtilServer (context: EdgeContext, folder: DiskletFolder, usernames: Array<string>) {
  let jsonObj: null | Object = null
  try {
    const json = await folder.file(UTILITY_SERVER_FILE).getText()
    jsonObj = JSON.parse(json)
  } catch (err) {
    console.log(err)
  }

  if (jsonObj) {
    if (jsonObj.currencyCode) {
      global.currencyCode = jsonObj.currencyCode
    }
    return
  }
  if (usernames.length === 0 && !jsonObj) {
    // New app launch. Query the utility server for referral information
    try {
      const response = await fetch('https://util1.edge.app/ref')
      if (response) {
        const util = await response.json()
        if (util.currencyCode) {
          global.currencyCode = util.currencyCode
        }
        // Save util data
        folder.file(UTILITY_SERVER_FILE).setText(JSON.stringify(util))
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default class Main extends Component<Props, State> {
  keyboardDidShowListener: any
  keyboardDidHideListener: any

  constructor (props: Props) {
    super(props)
    slowlog(this, /.*/, global.slowlogOptions)

    this.state = {
      context: undefined
    }
  }

  UNSAFE_componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  componentDidMount () {
    const id = DeviceInfo.getUniqueID()
    global.firebase && global.firebase.analytics().setUserId(id)
    global.firebase && global.firebase.analytics().logEvent(`Start_App`)
    makeCoreContext(pluginFactories).then(context => {
      const folder = makeReactNativeFolder()

      // Put the context into Redux:
      this.props.addContext(context, folder)

      CONTEXT_API.listUsernames(context).then(usernames => {
        this.props.addUsernames(usernames)
        queryUtilServer(context, folder, usernames)
      })
      setIntlLocale(localeInfo)
      selectLocale(DeviceInfo.getDeviceLocale())
      SplashScreen.close({
        animationType: SplashScreen.animationType.fade,
        duration: 850,
        delay: 500
      })
    })
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this.doDeepLink(url)
        }
        // this.navigate(url);
      })
      .catch(e => console.log(e))
    Linking.addEventListener('url', this.handleOpenURL)
  }
  doDeepLink (url: string) {
    const parsedUri = URI.parse(url)
    const query = parsedUri.query
    if (!query || !query.includes('token=')) {
      return
    }
    const splitArray = query.split('token=')
    const nextString = splitArray[1]
    const finalArray = nextString.split('&')
    const token = finalArray[0]
    this.props.urlReceived(token)
  }
  handleOpenURL = (event: Object) => {
    this.doDeepLink(event.url)
  }

  updateSceneKeyRequest = () => {
    this.props.updateCurrentSceneKey(Constants.REQUEST)
  }

  render () {
    return (
      <MenuProvider style={styles.mainMenuContext}>
        <RouterWithRedux backAndroidHandler={this.handleBack}>
          <Overlay>
            <Modal hideNavBar transitionConfig={() => ({ screenInterpolator: CardStackStyleInterpolator.forFadeFromBottomAndroid })}>
              {/* <Lightbox> */}
              <Stack key={Constants.ROOT} hideNavBar panHandlers={null}>
                <Scene key={Constants.LOGIN} initial component={LoginConnector} username={this.props.username} />

                <Scene key={Constants.ONBOARDING} navTransparent={true} component={OnBoardingComponent} />
                <Scene
                  key={Constants.TRANSACTION_DETAILS}
                  navTransparent={true}
                  onEnter={() => this.props.requestPermission(PermissionStrings.CONTACTS)}
                  clone
                  component={TransactionDetails}
                  renderTitle={this.renderTitle(TRANSACTION_DETAILS)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderMenuButton()}
                />

                <Drawer key={Constants.EDGE} hideNavBar contentComponent={ControlPanel} hideDrawerButton={true} drawerPosition="right" drawerWidth={scale(280)}>
                  {/* Wrapper Scene needed to fix a bug where the tabs would reload as a modal ontop of itself */}
                  <Scene hideNavBar>
                    <Tabs
                      key={Constants.EDGE}
                      swipeEnabled={false}
                      navTransparent={true}
                      tabBarPosition={'bottom'}
                      showLabel={true}
                      tabBarStyle={styles.footerTabStyles}
                    >
                      <Stack key={Constants.WALLET_LIST} icon={this.icon(Constants.WALLET_LIST)} tabBarLabel={WALLETS}>
                        <Scene
                          key={Constants.WALLET_LIST_SCENE}
                          navTransparent={true}
                          component={WalletList}
                          renderTitle={this.renderTitle(WALLETS)}
                          renderLeftButton={this.renderHelpButton()}
                          renderRightButton={this.renderMenuButton()}
                        />

                        <Scene
                          key={Constants.CREATE_WALLET_SELECT_CRYPTO}
                          navTransparent={true}
                          component={CreateWalletSelectCrypto}
                          renderTitle={this.renderTitle(CREATE_WALLET_SELECT_CRYPTO)}
                          renderLeftButton={this.renderBackButton(WALLETS)}
                          renderRightButton={this.renderEmptyButton()}
                        />

                        <Scene
                          key={Constants.CREATE_WALLET_NAME}
                          navTransparent={true}
                          component={CreateWalletName}
                          renderTitle={this.renderTitle(CREATE_WALLET)}
                          renderLeftButton={this.renderBackButton()}
                          renderRightButton={this.renderEmptyButton()}
                        />

                        <Scene
                          key={Constants.CREATE_WALLET_SELECT_FIAT}
                          navTransparent={true}
                          component={CreateWalletSelectFiat}
                          renderTitle={this.renderTitle(CREATE_WALLET_SELECT_FIAT)}
                          renderLeftButton={this.renderBackButton()}
                          renderRightButton={this.renderEmptyButton()}
                        />

                        <Scene
                          key={Constants.CREATE_WALLET_REVIEW}
                          navTransparent={true}
                          component={CreateWalletReview}
                          renderTitle={this.renderTitle(CREATE_WALLET)}
                          renderLeftButton={this.renderBackButton()}
                          renderRightButton={this.renderEmptyButton()}
                        />

                        <Scene
                          key={Constants.TRANSACTION_LIST}
                          onEnter={() => {
                            this.props.requestPermission(PermissionStrings.CONTACTS)
                            this.props.updateCurrentSceneKey(Constants.TRANSACTION_LIST)
                          }}
                          navTransparent={true}
                          component={TransactionListConnector}
                          renderTitle={this.renderWalletListNavBar()}
                          renderLeftButton={this.renderBackButton(WALLETS)}
                          renderRightButton={this.renderMenuButton()}
                        />

                        <Scene
                          key={Constants.MANAGE_TOKENS}
                          renderLeftButton={this.renderBackButton()}
                          navTransparent={true}
                          component={ManageTokens}
                          renderTitle={this.renderTitle(MANAGE_TOKENS)}
                          renderRightButton={this.renderEmptyButton()}
                          animation={'fade'}
                          duration={600}
                        />
                        <Scene
                          key={Constants.ADD_TOKEN}
                          component={AddToken}
                          navTransparent={true}
                          onLeft={Actions.pop}
                          renderLeftButton={this.renderBackButton()}
                          renderRightButton={this.renderEmptyButton()}
                          renderTitle={this.renderTitle(ADD_TOKEN)}
                        />
                        <Scene
                          key={Constants.EDIT_TOKEN}
                          component={EditToken}
                          navTransparent={true}
                          renderLeftButton={this.renderBackButton()}
                          renderRightButton={this.renderEmptyButton()}
                          renderTitle={this.renderTitle(EDIT_TOKEN)}
                        />
                        <Scene
                          key={Constants.TRANSACTIONS_EXPORT}
                          navTransparent={true}
                          component={ifLoggedIn(TransactionsExportSceneConnector, LoadingScene)}
                          renderTitle={this.renderTitle(TRANSACTIONS_EXPORT)}
                          renderLeftButton={this.renderBackButton(WALLETS)}
                          renderRightButton={this.renderEmptyButton()}
                        />
                      </Stack>

                      <Scene
                        key={Constants.REQUEST}
                        navTransparent={true}
                        onEnter={this.updateSceneKeyRequest}
                        icon={this.icon(Constants.REQUEST)}
                        tabBarLabel={REQUEST}
                        component={Request}
                        renderTitle={this.renderWalletListNavBar()}
                        renderLeftButton={this.renderRequestMenuButton()}
                        renderRightButton={this.renderMenuButton()}
                      />

                      <Stack key={Constants.SCAN} icon={this.icon(Constants.SCAN)} tabBarLabel={SCAN}>
                        <Scene
                          key={Constants.SCAN_NOT_USED}
                          navTransparent={true}
                          onEnter={() => {
                            this.props.requestPermission(PermissionStrings.CAMERA)
                            this.props.dispatchEnableScan()
                          }}
                          onExit={this.props.dispatchDisableScan}
                          component={Scan}
                          renderTitle={this.renderWalletListNavBar()}
                          renderLeftButton={this.renderHelpButton()}
                          renderRightButton={this.renderMenuButton()}
                        />
                        <Scene
                          key={Constants.EDGE_LOGIN}
                          navTransparent={true}
                          component={EdgeLoginSceneConnector}
                          renderTitle={this.renderTitle(EDGE_LOGIN)}
                          renderLeftButton={this.renderHelpButton()}
                          renderRightButton={this.renderEmptyButton()}
                        />
                      </Stack>

                      <Stack key={Constants.EXCHANGE} icon={this.icon(Constants.EXCHANGE)} tabBarLabel={EXCHANGE}>
                        <Scene
                          key={Constants.EXCHANGE_SCENE}
                          navTransparent={true}
                          component={ExchangeConnector}
                          renderTitle={this.renderTitle(EXCHANGE)}
                          renderLeftButton={this.renderExchangeButton()}
                          renderRightButton={this.renderMenuButton()}
                          onEnter={() => this.props.checkEnabledExchanges()}
                        />
                        <Scene
                          key={Constants.EXCHANGE_QUOTE_PROCESSING_SCENE}
                          navTransparent={true}
                          hideTabBar
                          component={CryptoExchangeQuoteProcessingScreenComponent}
                          renderTitle={this.renderTitle(EXCHANGE)}
                          renderLeftButton={this.renderEmptyButton()}
                          renderRightButton={this.renderEmptyButton()}
                        />
                        <Scene
                          key={Constants.EXCHANGE_QUOTE_SCENE}
                          navTransparent={true}
                          component={CryptoExchangeQuoteConnector}
                          renderTitle={this.renderTitle(EXCHANGE)}
                          renderLeftButton={this.renderBackButton()}
                          renderRightButton={this.renderMenuButton()}
                        />
                      </Stack>
                    </Tabs>

                    <Stack key={Constants.SEND_CONFIRMATION} hideTabBar>
                      <Scene
                        key={Constants.SEND_CONFIRMATION_NOT_USED}
                        navTransparent={true}
                        hideTabBar
                        panHandlers={null}
                        component={SendConfirmation}
                        renderTitle={this.renderWalletName()}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderSendConfirmationButton()}
                      />
                      <Scene
                        key={Constants.CHANGE_MINING_FEE_SEND_CONFIRMATION}
                        navTransparent={true}
                        component={ChangeMiningFeeSendConfirmation}
                        renderTitle={this.renderTitle(CHANGE_MINING_FEE)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderHelpButton()}
                      />
                    </Stack>

                    <Stack key={Constants.MANAGE_TOKENS} hideTabBar>
                      <Scene
                        key={Constants.MANAGE_TOKENS_NOT_USED}
                        navTransparent={true}
                        component={ManageTokens}
                        renderTitle={this.renderTitle(MANAGE_TOKENS)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />

                      <Scene
                        key={Constants.ADD_TOKEN}
                        navTransparent={true}
                        component={AddToken}
                        renderTitle={this.renderTitle(ADD_TOKEN)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                    </Stack>

                    <Stack key={Constants.SETTINGS_OVERVIEW_TAB} hideDrawerButton={true}>
                      <Scene
                        key={Constants.SETTINGS_OVERVIEW}
                        navTransparent={true}
                        onEnter={() => this.props.showReEnableOtpModal()}
                        component={SettingsOverview}
                        renderTitle={this.renderTitle(SETTINGS)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      <Scene
                        key={Constants.CHANGE_PASSWORD}
                        navTransparent={true}
                        component={ChangePasswordConnector}
                        renderTitle={this.renderTitle(CHANGE_PASSWORD)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      <Scene
                        key={Constants.CHANGE_PIN}
                        navTransparent={true}
                        component={ChangePinConnector}
                        renderTitle={this.renderTitle(CHANGE_PIN)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      <Scene
                        key={Constants.OTP_SETUP}
                        navTransparent={true}
                        component={OtpSettingsSceneConnector}
                        renderTitle={this.renderTitle(OTP)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      <Scene
                        key={Constants.RECOVER_PASSWORD}
                        navTransparent={true}
                        component={PasswordRecoveryConnector}
                        renderTitle={this.renderTitle(PASSWORD_RECOVERY)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      <Scene
                        key={Constants.SPENDING_LIMITS}
                        navTransparent={true}
                        component={SpendingLimitsConnector}
                        renderTitle={this.renderTitle(SPENDING_LIMITS)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      <Scene
                        key={Constants.EXCHANGE_SETTINGS}
                        navTransparent={true}
                        component={ExchangeSettingsConnector}
                        renderTitle={this.renderTitle(EXCHANGE_SETTINGS)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                      {this.renderCurrencySettings()}
                      <Scene
                        key={Constants.DEFAULT_FIAT_SETTING}
                        navTransparent={true}
                        component={DefaultFiatSettingConnector}
                        renderTitle={this.renderTitle(DEFAULT_FIAT)}
                        renderLeftButton={this.renderBackButton()}
                        renderRightButton={this.renderEmptyButton()}
                      />
                    </Stack>

                    <Stack key={Constants.BUYSELL} hideDrawerButton={true}>
                      <Scene
                        key={Constants.BUYSELL}
                        navTransparent={true}
                        component={PluginBuySell}
                        renderTitle={this.renderTitle(PLUGIN_BUYSELL)}
                        renderLeftButton={this.renderBackButton(BACK)}
                        renderRightButton={this.renderEmptyButton()}
                        onLeft={Actions.pop}
                      />
                      <Scene
                        key={Constants.PLUGIN}
                        navTransparent={true}
                        component={ifLoggedIn(PluginView, LoadingScene)}
                        renderTitle={this.renderTitle(PLUGIN_BUYSELL)}
                        renderLeftButton={renderPluginBackButton(BACK)}
                        renderRightButton={this.renderEmptyButton()}
                      />
                    </Stack>

                    <Stack key={Constants.SPEND} hideDrawerButton={true}>
                      <Scene
                        key={Constants.SPEND}
                        navTransparent={true}
                        component={PluginSpend}
                        renderTitle={this.renderTitle(PLUGIN_SPEND)}
                        renderLeftButton={this.renderBackButton(BACK)}
                        renderRightButton={this.renderEmptyButton()}
                        onLeft={Actions.pop}
                      />
                      {/*
                        <Scene
                          key={Constants.PLUGIN}
                          navTransparent={true}
                          component={PluginView}
                          renderTitle={this.renderTitle(PLUGIN_SPEND)}
                          renderLeftButton={this.renderBackButton(BACK)}
                          renderRightButton={this.renderEmptyButton()}
                        />
                      ) */}
                    </Stack>
                    <Stack key={Constants.TERMS_OF_SERVICE}>
                      <Scene
                        key={Constants.TERMS_OF_SERVICE}
                        navTransparent={true}
                        component={TermsOfServiceComponent}
                        renderTitle={this.renderTitle(TERMS_OF_SERVICE)}
                        renderLeftButton={this.renderBackButton(BACK)}
                        renderRightButton={this.renderEmptyButton()}
                        onLeft={Actions.pop}
                      />
                    </Stack>
                  </Scene>
                </Drawer>
              </Stack>
            </Modal>
          </Overlay>
        </RouterWithRedux>
        <HelpModal style={{ flex: 1 }} />
        <ErrorAlert />
        <TransactionAlert />
        <AutoLogout />
        <ContactsLoader />
        <PasswordReminderModal />
        <PasswordRecoveryReminderModalConnector />
        <ModalManager />
        <PermissionsManager />

        <EdgeContextCallbackManager />
        <EdgeAccountCallbackManager />
        <EdgeWalletsCallbackManager />
      </MenuProvider>
    )
  }

  renderCurrencySettings = () => {
    const settings = []
    for (const key in Constants.CURRENCY_SETTINGS) {
      const { pluginName, currencyCode } = Constants.CURRENCY_SETTINGS[key]
      settings.push(
        <Scene
          key={key}
          pluginName={pluginName}
          currencyCode={currencyCode}
          navTransparent={true}
          component={CurrencySettings}
          renderTitle={
            <View style={styles.titleWrapper}>
              <CurrencySettingsTitleConnector key={key} cryptoKey={key} pluginName={pluginName} currencyCode={currencyCode} />
            </View>
          }
          renderLeftButton={this.renderBackButton()}
          renderRightButton={this.renderEmptyButton()}
        />
      )
    }
    return settings
  }

  renderWalletListNavBar = () => {
    return <Header />
  }

  renderWalletName = () => {
    return (
      <View style={styles.titleWrapper}>
        <WalletName />
      </View>
    )
  }

  renderEmptyButton = () => {
    return <BackButton />
  }

  renderHelpButton = () => {
    return <HelpButton />
  }

  renderBackButton = (label: string = BACK) => {
    return <BackButton withArrow onPress={this.handleBack} label={label} />
  }

  renderTitle = (title: string) => {
    return (
      <View style={styles.titleWrapper}>
        <T style={styles.titleStyle}>{title}</T>
      </View>
    )
  }

  renderMenuButton = () => {
    return (
      <TouchableWithoutFeedback onPress={this.props.openDrawer}>
        <Image source={MenuIcon} />
      </TouchableWithoutFeedback>
    )
  }

  renderExchangeButton = () => {
    return <ExchangeDropMenu />
  }

  renderRequestMenuButton = () => {
    return <RequestDropMenu />
  }

  renderSendConfirmationButton = () => {
    return <SendConfirmationOptions />
  }

  icon = (tabName: string) => (props: { focused: boolean }) => {
    if (typeof tabBarIconFiles[tabName] === 'undefined' || typeof tabBarIconFilesSelected[tabName] === 'undefined') {
      throw new Error('Invalid tabbar name')
    }
    let imageFile
    if (props.focused) {
      imageFile = tabBarIconFilesSelected[tabName]
    } else {
      imageFile = tabBarIconFiles[tabName]
    }
    return <Image source={imageFile} />
  }

  keyboardDidShow = (event: any) => {
    const keyboardHeight = event.endCoordinates.height
    this.props.setKeyboardHeight(keyboardHeight)
  }

  keyboardDidHide = () => {
    this.props.setKeyboardHeight(0)
  }

  isCurrentScene = (sceneKey: string) => {
    return Actions.currentScene === sceneKey
  }

  handleBack = () => {
    if (this.isCurrentScene(Constants.LOGIN)) {
      return false
    }
    if (this.isCurrentScene(Constants.WALLET_LIST_SCENE)) {
      return HwBackButtonHandler()
    }
    if (this.isCurrentScene(Constants.EXCHANGE_QUOTE_SCENE)) {
      return Actions.popTo(Constants.EXCHANGE_SCENE)
    }
    Actions.pop()
    return true
  }
}
