"""Local development server that tells the browser not to cache files.

Without this, browsers keep old JavaScript and CSS files after a change, so fixes
seem to have no effect until a hard reload.
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Serves files from the current directory with caching disabled."""

    def end_headers(self):
        """Adds no-cache headers to every response before ending the headers."""
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    """Starts the server on the port given as first argument (default 8080)."""
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()


if __name__ == "__main__":
    main()
