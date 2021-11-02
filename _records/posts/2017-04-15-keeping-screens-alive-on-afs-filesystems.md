---
layout: post
title: Keeping Screens Alive on AFS Filesystems
date: 2016-04-14
categories: posts
description: |
  A simple solution to renewing authentication tokens and prolonging user sessions on AFS filesystems.
thumbnail: /assets/posts/afs-sessions/afs-sessions-thumb.jpg
banner: /assets/posts/afs-sessions/afs-sessions-banner.png
thumbnail_color: '000000'
invert: true
---

Shared filesystem servers like [AFS](https://en.wikipedia.org/wiki/Andrew_File_System) sometimes try to manage the duration of user sessions through the concept of authentication tokens. If you SSH to a server running AFS, you create a token that grants you access to your portion of the filesystem. Once you logout, that token is destroyed, which cuts off access to the filesystem.

If a user starts some background processes (e.g. behind a [screen](https://www.gnu.org/software/screen/manual/screen.html)) during the course of a session and then logs out, or if that user stays logged in but outstays the duration of their token, their jobs will eventually flail if they need to interact with the filesystem.

One way around this problem is to obtain a token that is not associated with one's current session. Scott Hampton, a tremendously helpful guru at Notre Dame's Center for Research Computing, recently shared with me a series of steps one can take to access such a token:

{% highlight bash %}
# login to a machine
# Run these commands:
pagsh -c /bin/tcsh
kinit
aklog
source .cshrc
# start screen/tmux
# start jobs that you need to run
# detach screen/tmux as needed
# logout
# logout
{% endhighlight %}

This will create tokens that are good for 30 days. If you need more time than that to complete some jobs (God bless you), you can repeat the process.
