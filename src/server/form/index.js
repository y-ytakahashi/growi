module.exports = {
  login: require('./login'),
  register: require('./register'),
  invited: require('./invited'),
  revision: require('./revision'),
  comment: require('./comment'),
  me: {
    user: require('./me/user'),
    password: require('./me/password'),
    imagetype: require('./me/imagetype'),
    apiToken: require('./me/apiToken'),
  },
  admin: {
    app: require('./admin/app'),
    siteUrl: require('./admin/siteUrl'),
    mail: require('./admin/mail'),
    aws: require('./admin/aws'),
    plugin: require('./admin/plugin'),
    securityGeneral: require('./admin/securityGeneral'),
    securityPassportLdap: require('./admin/securityPassportLdap'),
    securityPassportSaml: require('./admin/securityPassportSaml'),
    securityPassportBasic: require('./admin/securityPassportBasic'),
    securityPassportGoogle: require('./admin/securityPassportGoogle'),
    securityPassportGitHub: require('./admin/securityPassportGitHub'),
    securityPassportTwitter: require('./admin/securityPassportTwitter'),
    securityPassportOidc: require('./admin/securityPassportOidc'),
    markdown: require('./admin/markdown'),
    markdownXss: require('./admin/markdownXss'),
    markdownPresentation: require('./admin/markdownPresentation'),
    customcss: require('./admin/customcss'),
    customscript: require('./admin/customscript'),
    customheader: require('./admin/customheader'),
    customtheme: require('./admin/customtheme'),
    customtitle: require('./admin/customtitle'),
    custombehavior: require('./admin/custombehavior'),
    customlayout: require('./admin/customlayout'),
    customfeatures: require('./admin/customfeatures'),
    customhighlightJsStyle: require('./admin/customhighlightJsStyle'),
    userInvite: require('./admin/userInvite'),
    slackIwhSetting: require('./admin/slackIwhSetting'),
    slackSetting: require('./admin/slackSetting'),
    userGroupCreate: require('./admin/userGroupCreate'),
    notificationGlobal: require('./admin/notificationGlobal'),
  },
};
