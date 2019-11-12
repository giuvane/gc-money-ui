export const environment = {
  production: true,
  apiUrl: 'https://algamoney-api-giuvane.herokuapp.com',

  tokenWhitelistedDomains: [ new RegExp('algamoney-api-giuvane.herokuapp.com') ],
  tokenBlacklistedRoutes: [ new RegExp('\/oauth\/token') ]

  // tokenWhitelistedDomains: [ /algamoney-api-giuvane.herokuapp.com/ ],
  // tokenBlacklistedRoutes: [/\/oauth\/token/]
};
