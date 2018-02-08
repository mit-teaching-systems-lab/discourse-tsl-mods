# discourse-tsl-mods
Discourse plugin with mods for TSL's EdX courses.  It contains three main pieces:

- Adds a feature for learners to create their own groups
- Sets backups to be daily by default
- Adds a layout for a banner post
- 

## Groups
### Learner user experience
#### 1. Learner sees a Groups category
![category](docs/category.png)

#### 2. Learner sees Groups that other learners have created
![groups](docs/groups.png)

#### 3. Learner can create their own Group
![create](docs/create.png)


### Course author user experience
#### 1. Author sets the name of the special "Groups" category
![setting](docs/author-setting.png)

#### 2. Author creates a new category with that name
![create category](docs/author-create.png)
![name category](docs/author-name.png)

#### 3. Learners can now create their own groups
![create new group](docs/author-done.png)


## Backups
See [this post](https://meta.discourse.org/t/configure-automatic-backups-for-discourse/14855).

Backing up to S3 is recommended, along with creating a new IAM user with a limited policy like this:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:ListBucketMultipartUploads"
            ],
            "Resource": [
                "arn:aws:s3:::whatever-the-course-is-called-backups"
            ],
            "Condition": {}
        },
        {
            "Action": [
                "s3:AbortMultipartUpload",
                "s3:DeleteObject*",
                "s3:GetObject*",
                "s3:PutObject*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::whatever-the-course-is-called-backups/*"
            ]
        }
    ]
}
```

## Theming
Add this to a theme in the `Desktop` > `After Header` section, replacing the button text and course URL for your course:
```
<a
  style="display: inline-block;
    position: relative;
    display: inline-block;
    background: #28a9e0;
    color: white;
    padding: 5px 12px;
    font-size: 1.143em;
    margin-bottom: 5px;"
   href="https://edge.edx.org/courses/course-v1:MITx+11154x_XQ+2017MAY/info">Back to Edge</a>
```

## Local development
You can develop with Vagrant ([see Discourse docs](https://github.com/discourse/discourse/blob/master/docs/VAGRANT.md)).  As you develop, clear the ERB cache, copy this repository to the `plugins` folder and restart Rails to see changes.

On OSX you may also need to enable NFS for volume sharing, by adding an option to the Discourse Vagrantfile:

```
config.vm.synced_folder ".", "/vagrant", id: "vagrant-root", nfs: true
```

Example (also using `discourse-edx-lti`):
```
rm -rf tmp/cache && \
rm -rf plugins && \
git checkout head -- plugins && \
rsync -av --exclude .git \
  ~/github/mit-teaching-systems-lab/discourse-edx-lti \
  ./plugins/ && \
rsync -av --exclude .git \
  ~/github/mit-teaching-systems-lab/discourse-tsl-mods \
  ./plugins/ && \
vagrant ssh -c 'cd /vagrant && bundle exec rails s -b 0.0.0.0'
```
