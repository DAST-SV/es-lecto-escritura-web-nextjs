# Storage: App Buckets

Storage buckets configuration for the application.

## Structure

```
storage/
├── 00_init.sql              # Extensions and permissions
├── buckets/
│   ├── public_images.sql    # Public images bucket (site assets)
│   └── user_avatars.sql     # User avatars bucket
└── README.md
```

## Buckets

| Bucket | Public | Max Size | Purpose |
|--------|--------|----------|---------|
| `public-images` | Yes | 5MB | Site images (dashboard, categories, etc.) |
| `user-avatars` | Yes | 2MB | User profile avatars |

## Execution Order

```sql
\i 00_init.sql
\i buckets/public_images.sql
\i buckets/user_avatars.sql
```

---

**Version:** 1.0
**Updated:** 2026-01-27
