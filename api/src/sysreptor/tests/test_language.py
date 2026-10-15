import pytest
from django.urls import reverse

from sysreptor.tests.mock import api_client, create_user
from sysreptor.utils.language import Language, is_rtl_language


class TestLanguage:
    def test_rtl_languages(self):
        assert Language.is_rtl(Language.ARABIC)
        assert Language.is_rtl(Language.HEBREW)
        assert not Language.is_rtl(Language.ENGLISH_US)
        assert not Language.is_rtl(Language.GERMAN_DE)

    def test_is_rtl_matches_primary_language_subtag(self):
        assert is_rtl_language('ar')
        assert is_rtl_language('ar-SA')
        assert is_rtl_language('he')
        assert is_rtl_language('he-IL')
        assert not is_rtl_language('en-US')
        assert not is_rtl_language('de')
        assert not is_rtl_language(None)
        assert not is_rtl_language('')

    def test_rtl_languages_available_in_choices(self):
        assert Language.ARABIC in Language
        assert Language.HEBREW in Language
        assert 'ar' in {l[0] for l in Language.choices}
        assert 'he' in {l[0] for l in Language.choices}


class TestLanguageSettingsEndpoint:
    @pytest.mark.django_db()
    def test_languages_contain_rtl_flag(self):
        res = api_client(create_user()).get(reverse('publicutils-settings'))
        assert res.status_code == 200
        languages = {l['code']: l for l in res.data['languages']}
        assert languages['ar']['rtl'] is True
        assert languages['he']['rtl'] is True
        assert languages['en-US']['rtl'] is False
        assert languages['de-DE']['rtl'] is False
