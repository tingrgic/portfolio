# Local and VPN hosting

Install Node.js 22.12+ (or 24 LTS) and pnpm. `pnpm install`, then `pnpm dev` opens the loopback-only server at http://127.0.0.1:5173. `pnpm build` generates dist; `pnpm preview` serves it on http://127.0.0.1:4173.

Opt in to another-device access with `pnpm dev:host --port 5173` or `pnpm preview:host --port 4173`. These bind 0.0.0.0, which includes all machine interfaces, not only VPN. Use your OS firewall to restrict access to trusted VPN peers/subnet. We do not modify firewall rules or create internet tunnels. Do not forward the port on your router.

Connect both devices to your existing VPN and open `http://<PC-VPN-IP>:5173` (dev) or `http://<PC-VPN-IP>:4173` (preview). Use the PC's VPN IP, not localhost and not 0.0.0.0. VPN routing must permit peer-to-peer access. The PC and server process must stay running. If unavailable, check the chosen port, VPN routing and host firewall; no scanning needed.

On this PC, the portfolio has a dedicated private endpoint managed by Tailscale Serve:

`https://jellyfin-server.tail253f4c.ts.net:4178/`

The local `tin-portfolio.service` serves `dist/` at `127.0.0.1:4178`; Tailscale terminates HTTPS and exposes that port only to the tailnet. This avoids conflicts with the separate PK Normal servers already using ports 4173 and 5173. The phone must open the hostname above. `127.0.0.1` on a phone always means the phone itself.

On Windows, allow the specific Node server port only on the appropriate trusted profile/subnet. Avoid broad public-network rules. Vite rejects unrecognized hostnames by default; use the VPN IP or set an explicitly trusted hostname in vite.config.ts if needed. Do not set allowedHosts to true.

Change ports using `--port <number>`. strictPort is enabled so a conflict produces an error instead of silently moving ports. Preview is convenient for personal VPN testing, not a hardened production internet server. To persist locally, serve dist with a static server bound/restricted to the intended interface using your normal OS service setup.
