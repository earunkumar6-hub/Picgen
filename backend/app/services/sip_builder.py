from app.schemas.prompt import PromptBuildRequest

ANTI_SLOP_TEXT = {
    "No Gradients": "no gradients",
    "No Neon Glow": "no neon glow effects",
    "No 3D Text": "no 3D or extruded text",
    "No Floating Particles": "no floating particles or bokeh dust",
    "No Generic Futuristic Elements": "no generic sci-fi/futuristic clichés",
    "No Random Icons": "no decorative icons that aren't part of the subject",
    "No Excessive Shadows": "no exaggerated drop shadows",
    "No Unnecessary Decorations": "no unnecessary decorative elements",
    "No Clutter": "no visual clutter, keep composition clean",
    "No Fake UI": "no fake app/UI chrome overlays",
    "No Stock Poster Aesthetic": "avoid generic stock-poster aesthetics",
}


def build_sip_prompt(req: PromptBuildRequest) -> str:
    """Compose a structured SIP (Style, Intent, Parameters, Anti-Slop) prompt string."""
    p = req.parameters
    color_clause = f"Color palette: {p.colors}. " if p.colors.strip() else ""

    lines = [
        f"Style: {req.style}.",
        f"Intent: convey a sense of {req.intent.lower()}.",
        f"Subject: {req.subject.strip()}",
        (
            f"Layout: {p.layout.lower()} composition. "
            f"Typography: {p.typography.lower()}. "
            f"{color_clause}"
            f"Spacing: {p.spacing.lower()}. "
            f"Aspect ratio: {p.aspect_ratio}."
        ),
    ]

    if req.anti_slop_rules:
        constraints = [ANTI_SLOP_TEXT.get(rule, rule.lower()) for rule in req.anti_slop_rules]
        lines.append("Constraints: " + "; ".join(constraints) + ".")

    return "\n".join(lines)
