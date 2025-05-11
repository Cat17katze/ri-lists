# List Manager YunoHost Package

This directory contains the files needed to package the List Manager web application for YunoHost.

## Package Structure

```
listmanager_ynh/
├── conf/
│   ├── nginx.conf       # Nginx configuration template
│   └── systemd.service  # Systemd service template
├── doc/
│   └── README.md        # This file (or link to it)
├── scripts/
│   ├── install          # Installation script
│   ├── remove           # Removal script
│   ├── upgrade          # Upgrade script
│   ├── backup           # Backup script
│   └── restore          # Restore script
├── sources/
│   ├── src/             # Original Flask application source code
│   ├── requirements.txt # Python dependencies
│   └── ...              # Other files from the original app
└── manifest.toml        # Package manifest
```

## Testing (Required)

**This package has been created based on YunoHost documentation but has NOT been tested in a real YunoHost environment.**

You will need to test this package thoroughly in a dedicated YunoHost test environment (like a VM or LXC container) before considering it stable or using it in production.

**Testing Steps:**

1.  **Copy Package:** Transfer the `listmanager_ynh` directory to your YunoHost test server (e.g., using `scp`).
2.  **Check Package:** Run the YunoHost app checker from the parent directory:
    ```bash
    yunohost app check path/to/listmanager_ynh
    ```
    Address any errors or warnings reported by the checker.
3.  **Install:** Attempt to install the app from the local directory:
    ```bash
    sudo yunohost app install path/to/listmanager_ynh --debug
    ```
    Follow the prompts and monitor the installation log for errors.
4.  **Functionality Test:**
    *   Access the app at the domain/path chosen during installation.
    *   Test creating, viewing, editing, and deleting lists and items.
    *   Verify that data persists correctly.
5.  **Check Integration:**
    *   Verify the Nginx configuration (`/etc/nginx/conf.d/your_domain.d/listmanager.conf`).
    *   Check the Systemd service status (`sudo systemctl status listmanager.service`) and logs (`sudo journalctl -u listmanager.service`).
    *   Confirm data is being stored in `/home/yunohost.app/listmanager/` and that permissions are correct.
6.  **Upgrade Test (Simulated):**
    *   Make a small change (e.g., update the version in `manifest.toml` to `1.0~ynh2`, modify a file in `sources/`).
    *   Run the upgrade command:
        ```bash
        sudo yunohost app upgrade listmanager -u path/to/updated_listmanager_ynh --debug
        ```
    *   Verify the upgrade completes and the app still works.
7.  **Backup/Restore Test:**
    *   Create a backup: `sudo yunohost backup create --apps listmanager`
    *   Make a change in the app (e.g., add an item).
    *   Restore the backup: `sudo yunohost backup restore <backup_name> --apps listmanager`
    *   Verify the app state is reverted to the backup point.
8.  **Remove Test:**
    *   Remove the app: `sudo yunohost app remove listmanager`
    *   Choose whether to keep or remove data during the prompt.
    *   Verify the service, Nginx config, and directories are cleaned up correctly.

## Reporting Issues

If you encounter issues during testing, please refer to the YunoHost packaging documentation and forums. Debugging will likely involve examining the script logs (`--debug` flag) and checking system configurations.

