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
                "no_results": "Nothing found 🕵️‍♂️",
                "heroes": "Heroes",
                "villains": "Villains",
                "sort": "Sort:",
                "sort_az": "A → Z (Name)",
                "sort_za": "Z → A (Name)",
                "game": "Game:",
                "all_games": "All Games",
                "loading": "Loading library...",
                "reset_filters": "Reset filters"
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
                "founded": "Founded",

                "game": "Game",
                "game_placeholder": "e.g. The Witcher 3, Cyberpunk 2077...",
                "voice_actor": "Voice Actor",
                "cause_of_death": "Cause of Death",
                "family": "Family",
                "allies": "Allies",
                "enemies": "Enemies",
                "alignment": "Alignment"
            },
            "meta_values": {
                "Alive": "Alive",
                "Deceased": "Deceased",
                "Unknown": "Unknown",
                "Male": "Male",
                "Female": "Female",

                "Positive": "Hero",
                "Negative": "Villain",
                "Neutral": "Neutral"
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
                "login_to_comment": "Please <login>log in</login> to leave a comment.",
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
                "no_results": "Нічого не знайдено 🕵️‍♂️",
                "heroes": "Герої",
                "villains": "Лиходії",
                "sort": "Сортування:",
                "sort_az": "А → Я (Назва)",
                "sort_za": "Я → А (Назва)",
                "game": "Гра:",
                "all_games": "Всі ігри",
                "loading": "Завантаження бібліотеки...",
                "reset_filters": "Скинути фільтри"
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
                "founded": "Засновано",

                "game": "Гра",
                "game_placeholder": "напр. Відьмак 3, Cyberpunk 2077...",
                "voice_actor": "Голос",
                "cause_of_death": "Причина смерті",
                "family": "Сім'я",
                "allies": "Союзники",
                "enemies": "Вороги",
                "alignment": "Характер"
            },
            "meta_values": {
                "Alive": "Живий",
                "Deceased": "Мертвий",
                "Unknown": "Невідомо",
                "Male": "Чоловік",
                "Female": "Жінка",

                "Positive": "Герой",
                "Negative": "Лиходій",
                "Neutral": "Нейтральний"
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
                "login_to_comment": "Будь ласка, <login>увійдіть</login>, щоб залишити коментар.",
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