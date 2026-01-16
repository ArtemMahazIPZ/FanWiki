import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "nav": {
                "home": "Home",
                "login": "Login",
                "register": "Register",
                "logout": "Logout",
                "admin": "Admin Panel",
                "hello": "Hello"
            },
            "home": {
                "title": "Wiki Hub",
                "subtitle": "Explore characters, locations, and artifacts of our universe.",
                "search_placeholder": "Search articles...",
                "found": "Articles found:",
                "read_more": "READ MORE",
                "no_results": "Nothing found 🕵️‍♂️"
            },
            "categories": {
                "All": "All Categories",
                "Character": "Characters",
                "Location": "Locations",
                "Weapon": "Weapons",
                "Event": "Events"
            },
            "article": {
                "edit": "Edit",
                "category": "Category",
                "status": "Status",
                "gender": "Gender",
                "damage": "Damage",
                "ammo": "Ammo",
                "year": "Year",
                "region": "Region",
                "population": "Population",
                "founded": "Founded"
            }
        }
    },
    uk: {
        translation: {
            "nav": {
                "home": "Головна",
                "login": "Вхід",
                "register": "Реєстрація",
                "logout": "Вийти",
                "admin": "Адмін Панель",
                "hello": "Привіт"
            },
            "home": {
                "title": "Wiki Hub",
                "subtitle": "Досліджуйте персонажів, локації та артефакти нашого всесвіту.",
                "search_placeholder": "Пошук статей...",
                "found": "Знайдено статей:",
                "read_more": "ЧИТАТИ",
                "no_results": "Нічого не знайдено 🕵️‍♂️"
            },
            "categories": {
                "All": "Всі категорії",
                "Character": "Персонажі",
                "Location": "Локації",
                "Weapon": "Зброя",
                "Event": "Події"
            },
            "article": {
                "edit": "Редагувати",
                "category": "Категорія",
                "status": "Статус",
                "gender": "Стать",
                "damage": "Урон",
                "ammo": "Набої",
                "year": "Рік",
                "region": "Регіон",
                "population": "Населення",
                "founded": "Засновано"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'uk',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;