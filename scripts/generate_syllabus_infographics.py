# One-off content generator: produces one infographic-card SVG per TN 8th Std
# Math/Science unit for the teacher "Class Syllabus Board" feature.
import os
import html
import textwrap

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "images", "syllabus")
os.makedirs(OUT_DIR, exist_ok=True)

PALETTE = [
    "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6",
    "#06b6d4", "#ef4444", "#0ea5e9", "#84cc16", "#f97316",
]

MATH_UNITS = [
    dict(n=1, slug="numbers", icon="\U0001F522", title="Numbers", tamil="எண்கள்",
         desc="Rational numbers, number line, squares, square roots, cubes, cube roots and exponents.",
         tip="Practice locating rational numbers on a number line daily."),
    dict(n=2, slug="measurements", icon="\U0001F4CF", title="Measurements", tamil="அளவைகள்",
         desc="Area of circles and combined shapes; surface area & volume of 3-D solids like cylinders and cones.",
         tip="Draw the net of a solid before finding its surface area."),
    dict(n=3, slug="algebra", icon="➕", title="Algebra", tamil="இயற்கணிதம்",
         desc="Operations on algebraic expressions, identities, factorisation and graphing linear equations.",
         tip="Always verify a factorisation by expanding it back out."),
    dict(n=4, slug="life-mathematics", icon="\U0001F4B0", title="Life Mathematics", tamil="வாழ்வியல் கணிதம்",
         desc="Real-life applications: percentages, profit/loss, GST, compound interest, and time & work.",
         tip="Convert percentages to decimals first to simplify calculations."),
    dict(n=5, slug="geometry", icon="\U0001F4D0", title="Geometry", tamil="வடிவியல்",
         desc="Congruent & similar shapes, Pythagoras theorem, and constructing quadrilaterals with ruler & compass.",
         tip="Sketch a rough figure before starting any construction."),
    dict(n=6, slug="statistics", icon="\U0001F4CA", title="Statistics", tamil="புள்ளியியல்",
         desc="Organising data into frequency tables and representing it through histograms and graphs.",
         tip="Choose equal class intervals for a clear histogram."),
    dict(n=7, slug="information-processing", icon="\U0001F4A1", title="Information Processing", tamil="தகவல் செயலாக்கம்",
         desc="Counting principles, Fibonacci numbers, HCF, cryptarithms and logical puzzles.",
         tip="Break big counting problems into smaller independent steps."),
]

SCIENCE_UNITS = [
    dict(n=1, slug="measurement", icon="\U0001F4CF", title="Measurement", tamil="அளவீட்டியல்",
         desc="Fundamental & derived physical quantities, SI units, and types of measuring instruments.",
         tip="Always note the unit along with every measured value."),
    dict(n=2, slug="force-and-pressure", icon="\U0001F3CB️", title="Force and Pressure", tamil="விசையும் அழுத்தமும்",
         desc="Balanced & unbalanced forces, and how pressure acts in solids, liquids and gases.",
         tip="Pressure = Force / Area -- a smaller area means greater pressure."),
    dict(n=3, slug="optics", icon="\U0001F526", title="Optics", tamil="ஒளியியல்",
         desc="Laws of reflection & refraction of light, lenses, and how the human eye works.",
         tip="A convex lens converges light; a concave lens diverges it."),
    dict(n=4, slug="heat", icon="\U0001F321️", title="Heat", tamil="வெப்பம்",
         desc="Heat vs temperature, thermometers, and the modes of heat transfer.",
         tip="Heat always flows from a hotter body to a colder one."),
    dict(n=5, slug="electricity", icon="\U0001F50C", title="Electricity", tamil="மின்னியல்",
         desc="Electric current, simple circuits, and the heating & magnetic effects of current.",
         tip="Current flows only in a closed circuit."),
    dict(n=6, slug="sound", icon="\U0001F50A", title="Sound", tamil="ஒலியியல்",
         desc="How sound is produced and travels, and the difference between noise and music.",
         tip="Sound needs a medium -- it cannot travel through vacuum."),
    dict(n=7, slug="magnetism", icon="\U0001F9F2", title="Magnetism", tamil="காந்தவியல்",
         desc="Properties of magnets, magnetic field lines, and how electromagnets work.",
         tip="Like poles repel, unlike poles attract."),
    dict(n=8, slug="universe-and-space-science", icon="\U0001F680", title="Universe & Space Science", tamil="அண்டம் & விண்வெளி அறிவியல்",
         desc="The solar system, artificial satellites, and India's space missions.",
         tip="Remember the order of planets from the Sun outward."),
    dict(n=9, slug="matter-around-us", icon="\U0001F9EA", title="Matter Around Us", tamil="பருப்பொருள்கள்",
         desc="States of matter, and classifying substances as elements, compounds or mixtures.",
         tip="A mixture can be separated by physical methods; a compound cannot."),
    dict(n=10, slug="changes-around-us", icon="\U0001F504", title="Changes Around Us", tamil="மாற்றங்கள்",
         desc="Distinguishing physical & chemical changes and identifying types of chemical reactions.",
         tip="A chemical change always forms a new substance."),
    dict(n=11, slug="air", icon="\U0001F4A8", title="Air", tamil="காற்று",
         desc="Composition of air, layers of the atmosphere, and causes of air pollution.",
         tip="Nitrogen makes up about 78% of the air we breathe."),
    dict(n=12, slug="atomic-structure", icon="⚛️", title="Atomic Structure", tamil="அணு அமைப்பு",
         desc="Structure of the atom -- protons, neutrons, electrons -- and valency.",
         tip="Atomic number = number of protons in an atom."),
    dict(n=13, slug="water", icon="\U0001F4A7", title="Water", tamil="நீர்",
         desc="The water cycle, hard & soft water, and ways to conserve water.",
         tip="Boiling temporarily softens hard water caused by bicarbonates."),
    dict(n=14, slug="acids-and-bases", icon="\U0001F9EB", title="Acids and Bases", tamil="அமிலங்கள் & காரங்கள்",
         desc="Properties of acids and bases, indicators, pH scale, and neutralisation reactions.",
         tip="pH below 7 is acidic, above 7 is basic, and 7 is neutral."),
    dict(n=15, slug="chemistry-in-daily-life", icon="\U0001F9F4", title="Chemistry in Daily Life", tamil="அன்றாட வாழ்வில் வேதியியல்",
         desc="How soaps and detergents work, and common chemicals we use every day.",
         tip="Soap works best in soft water; detergents work in hard water too."),
    dict(n=16, slug="microorganisms", icon="\U0001F9A0", title="Microorganisms", tamil="நுண்ணுயிரிகள்",
         desc="Types of microorganisms and their useful and harmful effects on us.",
         tip="Not all microbes are harmful -- many help make curd and bread."),
    dict(n=17, slug="plant-world", icon="\U0001F331", title="Plant World", tamil="தாவர உலகம்",
         desc="Classifying plants, the process of photosynthesis, and plant tissue types.",
         tip="Photosynthesis needs sunlight, water, and carbon dioxide."),
    dict(n=18, slug="coordination-in-organisms", icon="\U0001F9E0", title="Coordination in Organisms", tamil="உயிரினங்களின் ஒருங்கிணைவு",
         desc="How the nervous system and hormones coordinate body functions.",
         tip="A reflex action is a rapid, automatic response to a stimulus."),
    dict(n=19, slug="locomotion-in-animals", icon="\U0001F9B4", title="Locomotion in Animals", tamil="விலங்குகளின் இயக்கம்",
         desc="The skeletal system, types of joints, and how different animals move.",
         tip="Joints allow movement -- without them bones couldn't bend."),
    dict(n=20, slug="reaching-the-age-of-adolescence", icon="\U0001F9D1", title="Age of Adolescence", tamil="வளரிளம் பருவமெடுதல்",
         desc="Physical and hormonal changes during adolescence, and staying healthy.",
         tip="A balanced diet and exercise support healthy growth at this stage."),
    dict(n=21, slug="crop-production-and-management", icon="\U0001F33E", title="Crop Production & Management", tamil="பயிர்ப் பெருக்கம் & மேலாண்மை",
         desc="Farming practices from sowing to harvesting, irrigation and fertilisers.",
         tip="Crop rotation helps restore soil nutrients naturally."),
    dict(n=22, slug="conservation-of-plants-and-animals", icon="\U0001F43E", title="Conservation of Plants & Animals", tamil="தாவரங்கள் மற்றும் விலங்குகளைப் பாதுகாப்பு",
         desc="Why forests & wildlife matter, and how we protect endangered species.",
         tip="Biosphere reserves protect entire ecosystems, not just one species."),
    dict(n=23, slug="libreoffice-calc", icon="\U0001F4BB", title="LibreOffice Calc", tamil="லிப்ரா ஆபீஸ் கால்க்",
         desc="Basics of spreadsheets -- entering data, using formulas, and creating charts.",
         tip="Start every formula in a spreadsheet cell with the '=' sign."),
]


def wrap_lines(text, width=42, max_lines=3):
    lines = textwrap.wrap(text, width=width)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip() + "..."
    return lines


def card_svg(unit, color):
    W, H = 380, 260
    tamil = html.escape(unit["tamil"])
    desc_lines = [html.escape(l) for l in wrap_lines(unit["desc"], width=40, max_lines=3)]
    tip_lines = [html.escape(l) for l in wrap_lines("Tip: " + unit["tip"], width=44, max_lines=2)]
    icon = unit["icon"]

    # Title wraps onto up to 2 lines and stays clear of the icon box (x >= 302).
    title_lines = [html.escape(l) for l in wrap_lines(unit["title"], width=20, max_lines=2)]
    title_font_size = 18 if len(title_lines) == 1 else 16
    title_line_h = 21 if len(title_lines) == 1 else 19
    title_start_y = 92
    title_tspans = "".join(
        f'<tspan x="24" dy="{0 if i == 0 else title_line_h}">{line}</tspan>' for i, line in enumerate(title_lines)
    )

    last_title_baseline = title_start_y + (len(title_lines) - 1) * title_line_h
    tamil_y = last_title_baseline + 18
    desc_y = tamil_y + 24

    desc_tspans = "".join(
        f'<tspan x="24" dy="{0 if i == 0 else 15}">{line}</tspan>' for i, line in enumerate(desc_lines)
    )
    tip_tspans = "".join(
        f'<tspan x="52" dy="{0 if i == 0 else 14}">{line}</tspan>' for i, line in enumerate(tip_lines)
    )

    tip_box_h = 26 + len(tip_lines) * 14
    tip_box_y = H - tip_box_h - 16

    svg = f'''<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Arial, sans-serif">
  <defs>
    <linearGradient id="badgeGrad{unit['n']}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{color}"/>
      <stop offset="100%" stop-color="{color}cc"/>
    </linearGradient>
  </defs>
  <rect x="1.5" y="1.5" width="{W-3}" height="{H-3}" rx="18" fill="#ffffff" stroke="{color}" stroke-width="2"/>
  <rect x="1.5" y="1.5" width="{W-3}" height="6" rx="3" fill="{color}"/>

  <circle cx="40" cy="46" r="20" fill="url(#badgeGrad{unit['n']})"/>
  <text x="40" y="52" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">{unit['n']}</text>

  <rect x="{W-68}" y="26" width="44" height="44" rx="12" fill="{color}1a"/>
  <text x="{W-46}" y="55" font-size="24" text-anchor="middle">{icon}</text>

  <text x="24" y="{title_start_y}" font-size="{title_font_size}" font-weight="800" fill="#0f172a">{title_tspans}</text>
  <text x="24" y="{tamil_y}" font-size="12" fill="#64748b" font-style="italic">{tamil}</text>

  <text x="24" y="{desc_y}" font-size="12.5" fill="#334155">{desc_tspans}</text>

  <rect x="24" y="{tip_box_y}" width="{W-48}" height="{tip_box_h}" rx="10" fill="{color}12" stroke="{color}33" stroke-width="1"/>
  <text x="34" y="{tip_box_y+22}" font-size="16">\U0001F4A1</text>
  <text x="52" y="{tip_box_y+21}" font-size="11" font-weight="600" fill="{color}">{tip_tspans}</text>
</svg>'''
    return svg


def generate(units, subject_prefix):
    for i, unit in enumerate(units):
        color = PALETTE[i % len(PALETTE)]
        svg = card_svg(unit, color)
        filename = f"{subject_prefix}-unit-{unit['n']:02d}-{unit['slug']}.svg"
        path = os.path.join(OUT_DIR, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg)
        print(f"wrote {filename}")


if __name__ == "__main__":
    generate(MATH_UNITS, "math")
    generate(SCIENCE_UNITS, "science")
    print(f"\nDone. {len(MATH_UNITS)} math + {len(SCIENCE_UNITS)} science SVGs written to {OUT_DIR}")
