"""The startup filter: whole company names, never a name hidden inside another."""
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from startup_job_scraper import is_startup, load_startup_names  # noqa: E402

NAMES = load_startup_names(str(HERE.parent.parent / 'startup-directory' / 'js' / 'startups-data.js'))


@pytest.mark.parametrize('company', [
    'Heima', 'Alda', 'Atlas', 'Kvika', 'Össur', 'Össur hf.', 'Embla Medical | Össur', 'Embla Medical',
    'beqom (PayAnalytics)', 'PayAnalytics', 'Rapyd', 'Rapyd Europe hf.', 'Ankeri Solutions', 'Ankeri',
    'Verne', 'Verne Global', 'AGR', 'AGR Dynamics', 'Abler - Sport Matters', 'Alvotech hf',
    'Coripharma ehf.', 'JBT Marel', 'indó sparisjóður 💸', 'Kvika banki hf.', 'Atlas Cloud ehf.',
])
def test_directory_startups_qualify(company):
    assert is_startup(company, NAMES)


@pytest.mark.parametrize('company', [
    'Leikskólinn Álfheimar, Selfossi', 'Leikskólinn Goðheimar', 'Leikskólinn Hulduheimar',
    'Leikskólinn Jötunheimar', 'Garðheimar', 'Sólheimar ses.', 'Heimaþjónusta Fjarðabyggðar',
    'Heimaleiga', 'Heimavist MA og VMA', 'Sóltún Heima', 'ALDA hótel', 'Aldan', 'Alda Safety',
    'Atlas Verktakar ehf', 'Kvik', 'Leikskólinn Álfheimar', 'Alda Öryggi ehf.', 'OK', 'KS', 'TM',
    'OR', 'VR', 'Trip Iceland',
])
def test_names_merely_containing_a_startup_do_not(company):
    assert not is_startup(company, NAMES)


def test_empty_and_missing_names_do_not_qualify():
    assert not is_startup('', NAMES)
    assert not is_startup(None, NAMES)
