jest.mock('../src/utils/storage', () => ({ getString: jest.fn(() => 'hi') }));
jest.mock('../src/utils', () => ({
    get: jest.fn(),
    navigatorConfig: jest.fn((key, fallback) => (key === 'availableLocales' ? ['en', 'hi'] : fallback)),
}));
jest.mock('../src/hooks/use-storage', () => jest.fn((key, fallback) => [fallback, jest.fn()]));
jest.mock('react-native-i18n', () => {
    const I18n = require('i18n-js');
    I18n.locale = 'en'; // what the library picks from the phone before the app runs
    return { __esModule: true, default: I18n };
});

test('the saved language is active as soon as the language module loads, before any screen renders', () => {
    const I18n = require('react-native-i18n').default;
    expect(I18n.locale).toBe('en');
    require('../src/contexts/LanguageContext');
    expect(I18n.locale).toBe('hi');
    expect(I18n.t('AccountScreen.signOut')).toBe(require('../translations/hi.json').AccountScreen.signOut);
});
