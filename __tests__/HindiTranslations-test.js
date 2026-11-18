import en from '../translations/en.json';
import hi from '../translations/hi.json';

jest.mock('../src/utils/storage', () => ({ getString: jest.fn(() => undefined) }));
jest.mock('../src/utils', () => ({
    get: jest.fn(),
    navigatorConfig: jest.fn((key, fallback) => (key === 'availableLocales' ? ['en', 'hi'] : fallback)),
}));
jest.mock('react-native-i18n', () => {
    const I18n = { locale: 'en', fallbacks: true, translations: {} };
    I18n.t = (key) => key.split('.').reduce((node, part) => node?.[part], I18n.translations[I18n.locale]);
    return { __esModule: true, default: I18n };
});

const flatten = (node, prefix = '') =>
    Object.entries(node).reduce((out, [key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return typeof value === 'object' ? { ...out, ...flatten(value, path) } : { ...out, [path]: value };
    }, {});
const placeholders = (text) => (text.match(/{{\s*\w+\s*}}/g) ?? []).sort();

describe('Hindi translations', () => {
    const enFlat = flatten(en);
    const hiFlat = flatten(hi);

    test('every English key exists in Hindi and nothing extra', () => {
        expect(Object.keys(hiFlat).sort()).toEqual(Object.keys(enFlat).sort());
    });

    test.each(Object.keys(enFlat))('%s keeps the same placeholders and is not empty', (key) => {
        expect(hiFlat[key].trim()).not.toBe('');
        expect(placeholders(hiFlat[key])).toEqual(placeholders(enFlat[key]));
    });

    test('Hindi never shows the upstream brand and uses 0-9 digits only', () => {
        Object.values(hiFlat).forEach((text) => {
            expect(text).not.toMatch(/fleetbase/i);
            expect(text).not.toMatch(/[०-९]/);
        });
    });

    test('localize exposes Hindi and translate returns Hindi text', () => {
        const I18n = require('react-native-i18n').default;
        const { getAvailableLocales, translate } = require('../src/utils/localize');
        I18n.translations = getAvailableLocales();
        expect(Object.keys(I18n.translations).sort()).toEqual(['en', 'hi']);
        I18n.locale = 'hi';
        expect(translate('AccountScreen.signOut')).toBe(hi.AccountScreen.signOut);
        expect(translate('AccountScreen.signOut')).not.toBe(en.AccountScreen.signOut);
    });
});
