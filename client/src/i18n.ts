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
                "hello": "Hello",
                "profile": "My Profile"
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
            },
            "meta_values": {
                "Alive": "Alive",
                "Deceased": "Deceased",
                "Unknown": "Unknown",
                "Male": "Male",
                "Female": "Female"
            },
            "profile": {
                "title": "User Profile",
                "upload_avatar": "Change Avatar",
                "save": "Save Changes",
                "email": "Email",
                "nickname": "Nickname"
            },
            "comments": {
                "title": "Comments",
                "placeholder": "Join the discussion...",
                "post": "Post Comment",
                "reply": "Reply",
                "send": "Send",
                "login_to_comment": "Please {{login}} to comment.",
                "login_link": "login",
                "delete_confirm": "Delete this comment?",
                "ban_prompt": "Ban user for how many minutes?",
                "user_banned": "User banned",
                "login_to_react": "Please login to react",
                "deleted_message": "[This comment has been deleted]"
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
                "hello": "Привіт",
                "profile": "Мій Профіль"
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
            },
            "meta_values": {
                "Alive": "Живий",
                "Deceased": "Мертвий",
                "Unknown": "Невідомо",
                "Male": "Чоловік",
                "Female": "Жінка"
            },
            "profile": {
                "title": "Профіль користувача",
                "upload_avatar": "Змінити аватар",
                "save": "Зберегти зміни",
                "email": "Пошта",
                "nickname": "Нікнейм"
            },
            "comments": {
                "title": "Коментарі",
                "placeholder": "Долучайтеся до обговорення...",
                "post": "Надіслати коментар",
                "reply": "Відповісти",
                "send": "Надіслати",
                "login_to_comment": "Будь ласка, {{login}}, щоб залишити коментар.",
                "login_link": "увійдіть",
                "delete_confirm": "Видалити цей коментар?",
                "ban_prompt": "На скільки хвилин забанити користувача?",
                "user_banned": "Користувача забанено",
                "login_to_react": "Увійдіть, щоб ставити реакції",
                "deleted_message": "[Цей коментар було видалено]"
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