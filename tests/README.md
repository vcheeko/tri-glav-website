# TRI-GLAV static quality tests

`test_site.py` validates the public landing page without adding runtime dependencies.

It checks document identity/language, metadata, local asset references, image alt text, unique IDs, internal anchors, HTTPS-only external references and the README boundary between the implemented website and future safety-product capabilities.

The tests do not certify production accessibility, emergency-system correctness or the future mobile application.
