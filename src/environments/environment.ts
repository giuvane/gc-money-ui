// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  agroApiUrl: 'http://api.agromonitoring.com/agro/1.0',
  bingMapsKey: 'AikcqJh-VT5_8KBzed95Ir6KMXqvXVwWekNOjhH44zrLbXLCu7D6-aO4gXpHZSrU',
  adb: 'https://adb.md.utfpr.edu.br',
  adbAuth: 'https://adb.md.utfpr.edu.br/api/data/v2/auth/login',

  tokenWhitelistedDomains: [
    new RegExp('localhost:8080'),
    new RegExp('adb.md.utfpr.edu.br')
  ],
  //tokenWhitelistedDomains: [ 'localhost:8080', 'https://adb.md.utfpr.edu.br', 'https://adb.md.utfpr.edu.br/api/data/v2/auth/login' ],
  tokenBlacklistedRoutes: [ new RegExp('\/oauth\/token') ]

  // tokenWhitelistedDomains: [ /localhost:8080/ ],
  // tokenBlacklistedRoutes: [/\/oauth\/token/]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
