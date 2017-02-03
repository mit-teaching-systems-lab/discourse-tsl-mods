# discourse-tsl-mods
Discourse plugin with mods for TSL's EdX courses

## TODO
- Form working
- XHR request and error handling
- Form conditional only on Groups category
- Style form, modal?
- Extract config for magic category


## Local development
You can develop with Vagrant ([see Discourse docs](https://github.com/discourse/discourse/blob/master/docs/VAGRANT.md)).  As you develop, clear the ERB cache, copy this repository to the `plugins` folder and restart Rails to see changes.

Example (also using `discourse-edx-lti`):
```
rm -rf tmp/cache && \
rm -rf ./plugins/discourse-edx-lti/ && \
rsync -av --exclude .git \
  ~/github/mit-teaching-systems-lab/discourse-edx-lti \
  ./plugins/ && \
rsync -av --exclude .git \
  ~/github/mit-teaching-systems-lab/discourse-tsl-mods \
  ./plugins/ && \
rsync -av --exclude .git \
  ~/github/Mittineague/discourse-plugin-outlet-locations \
  ./plugins/ && \
vagrant ssh -c 'cd /vagrant && bundle exec rails s -b 0.0.0.0'
```


## Cloning a site
See https://meta.discourse.org/t/move-your-discourse-instance-to-a-different-server/15721/20 or https://meta.discourse.org/t/is-there-any-way-to-restore-your-site-from-backup-in-the-terminal/42377/2


Example:
```
opts = {
  filename: "whateveryourforumiscalled-2016-04-12-153600.tar.gz",
  publish_to_message_bus: true
}

SiteSetting.allow_restore = true
BackupRestore.restore!(Discourse.system_user.id, opts)
```

Another:
```
script/discourse restore <filename.of.the.backup.tar.gz>
```

Note that there are several production settings you might need to change, like
backups to S3 buckets, and HTTPS only.

- Files > S3 keys
- Backups > Disable S3 backups


```
WARNING: force_https is enabled in dev
It is very unlikely you are running HTTPS in dev.
Without HTTPS your session cookie will not work
Try: bin/rails c
SiteSetting.force_https = false
```
