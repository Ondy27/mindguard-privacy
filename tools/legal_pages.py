"""Právní stránky Wickroot: zásady soukromí a podmínky použití pro všechny appky.

- vytvoří chybějící dokumenty (DOCS níže, kde je `sections`)
- na všech dokumentech sjednotí postranní menu „Documents“ (seskupené po appkách)

Spuštění z kořene webu:  python tools/legal_pages.py
"""
import re
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
MAIL = "onskteam@gmail.com"

APPS = [
    # slug, název, ikona, styl ikony, balíček
    ("mindguard", "MindGuard", "mindguard-icon.png", "", "com.onsk.pureweb"),
    ("streakly", "Streakly", "streakly-icon.png", "background:#FFFFFF;", "com.onsk.streakly"),
    ("maturitko", "Maturitko", "maturitko-icon.png", "background:#FFFFFF;", "cz.maturitko.app"),
    ("medlatina", "Medlatina", "medlatina-icon.png", "", "cz.medlatina.app"),
]
KINDS = [("privacy", "Privacy policy"), ("terms", "Terms of use")]

LAW = (
    "<p>These terms are governed by the law of the Czech Republic. A consumer dispute can also be resolved "
    "out of court through the Czech Trade Inspection Authority (adr.coi.cz).</p>"
)
LIABILITY = (
    "<p>We provide the app as is. The operator&#x27;s liability is limited to the extent permitted by law; "
    "this does not affect your rights as a consumer.</p>"
)

NEW = {
    ("privacy", "medlatina"): {
        "effective": "On release (version 1.0)",
        "lead": "<p class=\"lead-box\" style=\"margin-top:32px;background:#15161A;color:#F2EFE7;border-radius:18px;padding:22px 26px\">"
                "Medlatina works offline, without an account, ads or analytics. Your learning progress stays on your phone "
                "and is never sent to us.</p>"
                "<p>The app itself is in Czech; menu names on this page are translated into English.</p>",
        "sections": [
            ("Who runs the app", f"<p>Operator: Wickroot. Privacy questions: <a href=\"mailto:{MAIL}\">{MAIL}</a>.</p>"),
            ("What the app stores (on your device only)",
             "<ul><li><b>Learning progress:</b> finished lessons, the review schedule, XP, streak, daily goal, the faculty "
             "you chose and your exam date.</li>"
             "<li><b>Settings and rewards:</b> reminder time, sounds on/off, Ossík&#x27;s outfit, the colour theme, chapters "
             "unlocked as streak rewards, and the nickname you may enter as a supporter.</li>"
             "<li><b>Purchases:</b> whether you have the full course and how many coffees you bought for Ossík (to unlock "
             "the rewards).</li></ul>"
             "<p>All of this is kept in the app&#x27;s private storage. Uninstalling the app or clearing its data deletes it.</p>"),
            ("What the app does not do",
             "<p>Medlatina has no server and does not send your progress anywhere. It uses no cookies, analytics, "
             "advertising or crash-reporting tools and does not collect device identifiers.</p>"),
            ("Purchases",
             "<p>The full course (a one-time purchase) and the voluntary &quot;Buy Ossík a coffee&quot; tips are sold and "
             "processed by Google Play under Google&#x27;s terms and privacy policy. We never receive your payment details; "
             "the app only gets a confirmation from the store that a purchase is valid.</p>"),
            ("Reporting a mistake in the content",
             "<p>The &quot;Report a mistake&quot; button opens your e-mail app with a pre-filled message (the item and the "
             "content version). Sending it is up to you. If you send it, we will see your e-mail address and your message "
             "and use them only to fix the content and reply to you.</p>"),
            ("Permissions",
             "<ul><li><b>Notifications</b> – only for the daily reminder, if you turn it on. The reminder is scheduled on "
             "your phone and does not use the internet.</li>"
             "<li><b>Run after restart</b> – so that a scheduled reminder keeps working after the phone restarts.</li>"
             "<li><b>Google Play Billing</b> – only for purchases, through the Google Play Store app.</li></ul>"),
            ("Children", "<p>The app is meant for university students and is not directed at children.</p>"),
            ("Your rights",
             "<p>We do not store anything about you on servers, so we have no data to provide or delete – it is all on your "
             "phone. If you e-mailed us, you can ask us to delete that e-mail. You can also file a complaint with the Czech "
             "Office for Personal Data Protection (www.uoou.gov.cz).</p>"),
            ("Changes",
             "<p>If this policy changes (for example if syncing between devices is added), the new version will be "
             "published at this address and mentioned in the app update notes.</p>"),
        ],
    },
    ("terms", "medlatina"): {
        "effective": "On release (version 1.0)",
        "lead": "<p style=\"margin-top:32px\">The app itself is in Czech; menu names on this page are translated into English.</p>",
        "sections": [
            ("About the app",
             f"<p>Medlatina is an educational app for learning medical Latin. Operator: Wickroot, contact: "
             f"<a href=\"mailto:{MAIL}\">{MAIL}</a>. By using the app you agree to these terms. How the app handles data is "
             f"described in the Privacy policy.</p>"),
            ("Content and its accuracy",
             "<p>Lessons, explanations and exercises are carefully prepared, but they may still contain mistakes. The app "
             "supplements teaching – it does not replace your lectures, textbooks or materials from your faculty. The operator "
             "is not responsible for the result of your test or exam. If you find a mistake, please report it in the app or "
             "by e-mail.</p>"),
            ("Not an official app",
             "<p>Medlatina is an independent study aid. It is not affiliated with any medical faculty or university. The order "
             "of chapters and the pass marks in the mock exam are only a guide – always check them with your teacher.</p>"),
            ("Copyright",
             "<p>Exercise texts, explanations, the mascot Ossík, illustrations and sounds are the operator&#x27;s copyrighted "
             "works. You may use them freely for your own study; you may not copy them in bulk, distribute them or use them "
             "commercially without permission. Third-party works under open licences (fonts, anatomical terminology, data) "
             "are listed in the app under Settings → Sources and licences.</p>"),
            ("Free and paid parts",
             "<p>A part of the course is free: the first chapters, the first lesson of every chapter, a chapter of the week "
             "and chapters unlocked as streak rewards. The full course is a one-time purchase through Google Play; the price "
             "is shown in the app and in Google Play before you pay. There is no subscription.</p>"
             "<p>&quot;Buy Ossík a coffee&quot; is a voluntary tip. It unlocks only cosmetic rewards (outfits, colour themes, "
             "a supporter badge), it can be bought repeatedly and it cannot be restored on another device. Refunds are "
             "handled by Google Play under its rules.</p>"),
            ("Your data and progress",
             "<p>Your progress is stored only on your device. If you uninstall the app or lose your phone, the progress is "
             "lost; a purchase of the full course can be restored with the same Google account.</p>"),
            ("Liability", LIABILITY),
            ("Changes and governing law",
             "<p>We may update these terms (for example when new features are added) and will tell you about significant "
             "changes in the app in advance.</p>" + LAW),
        ],
    },
    ("terms", "mindguard"): {
        "effective": "15 November 2026",
        "lead": "",
        "sections": [
            ("About the app",
             f"<p>MindGuard helps you quit adult content: it blocks adult websites in supported web browsers and offers a "
             f"clean-days counter, breathing and meditation exercises and a panic button. Operator: Wickroot, contact: "
             f"<a href=\"mailto:{MAIL}\">{MAIL}</a>. By using the app you agree to these terms; how the app handles data is "
             f"described in the Privacy policy. The app is intended for adults (18+).</p>"),
            ("Not medical treatment",
             "<p>MindGuard is a self-help tool. It is not a medical device and does not replace professional help. If you "
             "feel that you cannot cope, or you are in crisis, please contact a doctor, a therapist or a crisis line.</p>"),
            ("How blocking works and its limits",
             "<p>Blocking uses the Android Accessibility Service, only after you agree to it in the app, and works in "
             "supported browsers. No filter is perfect: some pages may not be blocked and others may be blocked by mistake. "
             "You can turn the service off at any time in Android settings.</p>"),
            ("MindGuard Pro",
             "<p>Pro features are sold through Google Play as subscriptions or a lifetime purchase. The price and the "
             "billing period are shown in Google Play before you pay. Subscriptions renew automatically until you cancel "
             "them in Google Play (Play Store → Payments &amp; subscriptions). Refunds are handled by Google Play under "
             "its rules.</p>"),
            ("Fair use",
             "<p>Use MindGuard on your own device for yourself. Do not use it to monitor another person without their "
             "knowledge and consent.</p>"),
            ("Liability", LIABILITY),
            ("Changes and governing law",
             "<p>We may update these terms and will tell you about significant changes in the app in advance.</p>" + LAW),
        ],
    },
    ("terms", "streakly"): {
        "effective": "15 November 2026",
        "lead": "",
        "sections": [
            ("About the app",
             f"<p>Streakly is a habit tracker: you add habits, tick them off and follow your streaks and statistics. "
             f"Operator: Wickroot, contact: <a href=\"mailto:{MAIL}\">{MAIL}</a>. By using the app you agree to these terms; "
             f"how the app handles data is described in the Privacy policy.</p>"),
            ("Your data",
             "<p>Your habits and history are stored on your device. If you uninstall the app or lose your phone without a "
             "backup, the data may be lost.</p>"),
            ("Purchases",
             "<p>If the app offers paid features, they are sold through Google Play; the price is shown before you pay and "
             "refunds are handled by Google Play under its rules.</p>"),
            ("Not advice",
             "<p>Streakly helps you keep track of habits. It does not give medical, psychological or other professional "
             "advice.</p>"),
            ("Liability", LIABILITY),
            ("Changes and governing law",
             "<p>We may update these terms and will tell you about significant changes in the app in advance.</p>" + LAW),
        ],
    },
}


def docs_nav(kind: str, slug: str) -> str:
    """Postranní menu: appky, u každé zásady soukromí a podmínky."""
    out = ['<nav aria-label="Legal documents" style="border-top:1px solid #15161A">']
    for s, name, icon, bg, _ in APPS:
        out.append(
            f'<div style="padding:14px 0 6px;border-bottom:1px solid #D9D4C7">'
            f'<p style="margin:0 0 6px;display:flex;align-items:center;gap:8px;font-weight:700">'
            f'<img src="../../assets/img/{icon}" alt="" aria-hidden="true" style="width:22px;height:22px;border-radius:6px;{bg}">{name}</p>'
        )
        for k, label in KINDS:
            cur = k == kind and s == slug
            out.append(
                f'<a class="doc" href="../../{k}/{s}/"{" aria-current=\"page\"" if cur else ""} '
                f'style="display:block;padding:8px 10px;margin:0 0 4px;border-radius:10px;font-weight:{700 if cur else 600};'
                f'color:{"#2B55E6" if cur else "#15161A"};{"background:#E8E3D7" if cur else ""}">{label}</a>'
            )
        out.append("</div>")
    out.append("</nav>")
    return "".join(out)


def build_page(kind: str, slug: str, data: dict) -> str:
    tpl = (WEB / "terms/maturitko/index.html").read_text(encoding="utf8")
    _, name, icon, bg, package = next(a for a in APPS if a[0] == slug)
    label = dict(KINDS)[kind]
    title = f"{name} {label.lower()} · Wickroot"
    desc = f"{label} for the {name} app."
    s = tpl
    s = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", s)
    s = re.sub(r'(<meta name="description" content=")[^"]*', rf"\g<1>{desc}", s)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*', rf"\g<1>{title}", s)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', rf"\g<1>{desc}", s)
    s = s.replace("/terms/maturitko/", f"/{kind}/{slug}/")
    toc = "".join(
        f'<a href="#s{i}" style="color:#15161A">{h}</a>' for i, (h, _) in enumerate(data["sections"], 1)
    )
    s = re.sub(r'(<nav class="toc"[^>]*>).*?(</nav>)', rf"\g<1>{toc}\g<2>", s, flags=re.S)
    s = re.sub(
        r'<img src="../../assets/img/maturitko-icon.png" alt="" aria-hidden="true" style="[^"]*">',
        f'<img src="../../assets/img/{icon}" alt="" aria-hidden="true" style="width:56px;height:56px;border-radius:14px;{bg}">',
        s,
    )
    s = s.replace(">TERMS OF USE</span>", f">{label.upper()}</span>")
    s = re.sub(r"(clamp\(40px,5.6vw,76px\);line-height:.95;letter-spacing:-.035em\">)Maturitko(</h1>)", rf"\g<1>{name}\g<2>", s)
    s = s.replace(">cz.maturitko.app<", f">{package}<")
    s = s.replace(">1 October 2026 (version 1.0)<", f">{data['effective']}<")
    body = data["lead"] + "".join(
        f'<section id="s{i}"><h2>{h}</h2>{html}</section>' for i, (h, html) in enumerate(data["sections"], 1)
    )
    s = re.sub(
        r'(<div class="prose"[^>]*>).*?(</div>\n</article>)', lambda m: m.group(1) + body + m.group(2), s, flags=re.S
    )
    return s


def main() -> None:
    for (kind, slug), data in NEW.items():
        out = WEB / kind / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build_page(kind, slug, data), encoding="utf8")
        print("vytvořeno", out.relative_to(WEB))
    for kind, _ in KINDS:
        for slug, *_ in APPS:
            f = WEB / kind / slug / "index.html"
            s = f.read_text(encoding="utf8")
            s, n = re.subn(r'<nav aria-label="Legal documents".*?</nav>', docs_nav(kind, slug), s, flags=re.S)
            assert n == 1, f
            f.write_text(s, encoding="utf8")
    print("menu sjednoceno")


if __name__ == "__main__":
    main()
