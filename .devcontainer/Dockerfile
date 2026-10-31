FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# The base image's Yarn apt source can have an outdated signing key and break apt-get update; Yarn isn't used here.
RUN rm -f /etc/apt/sources.list.d/yarn.list

# Trust the UPM network's Zscaler proxy (laptops only). Put its root
# certificate (Base64/PEM, ending in .crt) in .devcontainer/certs/.
COPY certs/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates

# Restore standard /tmp permissions and pre-create the X11 socket dir
# so VS Code's "mkdir -p /tmp/.X11-unix" succeeds as the non-root user.
RUN chmod 1777 /tmp \
 && mkdir -p /tmp/.X11-unix \
 && chmod 1777 /tmp/.X11-unix

# SQLite CLI for inspecting the database. After the certificate step, so it works through Zscaler.
RUN apt-get update \
 && apt-get install -y --no-install-recommends sqlite3 \
 && rm -rf /var/lib/apt/lists/*