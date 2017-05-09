---
layout: post
title: Submitting Python Scripts to SGE Queues
date: 2013-09-05
categories: hpc
image: /assets/posts/sge-queues/sge-thumb.jpg
banner: /assets/posts/sge-queues/sge-banner.png
invert: true
---

I have recently begun submitting scripts to my home institution's computer cluster. Although submitting jobs to the cluster is a fairly straightforward task, it took me a bit of time to figure out how to format jobs such that the Sun Grid Engine queuing system employed here at Notre Dame could process my scripts and distribute them over the cluster. In case others would like to be able to distribute jobs over a Unix-based computer cluster that uses an SGE front end, I wanted to briefly type up the protocols I have followed to accomplish this task.

To submit a script to Notre Dame's SGE front end, one needs two files: a hashbanged script that one would like to run, and a .job file. Say the script you want to run is a Python script called "tmp.py". In order to prepare this script for the cluster, you will want to add a line at the very start of the script in order to point to the version of Python that you plan to employ in your script. This line has a variety of amusing names—it is sometimes called a shebang line, or a hashbang, crunchbang, hashpling, pound bang, etc.—but it usually takes a form such as the following:

{% highlight bash %}
#!/usr/bin/env python
{% endhighlight %}

Then, once you have your script ready to go, you only need to make a .job file that can tell the cluster where to find all of the elements required to run the script. My .job files look something like this:

{% highlight bash %}
#!/bin/csh
#$ -M dduhaime@nd.edu
#$ -m abe
#$ -r y
#$ -o tmp.out
#$ -e tmp.err
module load python/2.7.3
echo "Start - `date`"
python tmp.py 
echo "Finish - `date`"
{% endhighlight %}

The first line in this .job file indicates that the script intends to send a command to the C shell. The second line specifies the email address to which the cluster will report its output. The third line specifies that you would like the cluster to send emails to the email address in the -M line above when the cluster begins and ends the script. The fourth line is meant to indicate if your script is re-runnable (it appears that Gaussian scripts and certain machine learning algorithms are not re-runnable and so should be flagged -r n). The final two lines prefaced with #$ indicate the expected output files. The line that begins "module load" indicates, as one might expect, the module one would like to load (make sure to specify the version of the software you would like to run). The penultimate line indicates the name of the script you would like to run, and the echo lines merely ask the C shell to identify the start and end times of the job. Using a text editor like Notepad++, users can modify these fields to suit the demands of their job, and then save the file as something like "test.job".

Once you have your hashbanged script and your .job file, upload them to a directory on your cluster. I use Filezilla for this purpose, but one could accomplish the same task at the command line. Then, ssh to that directory (if you are working on a Windows machine, you can use Putty to accomplish this task). Then, once you're in the directory in which your .job and .py files are located, you can submit your job by simply typing "qsub test.job" and hitting enter. If you left the "-m abe" line in your .job script, you should soon receive an email indicating that your job has been submitted.

When I first started submitting scripts, I could tell by the email reports I received that my jobs began and ended almost simultaneously. Eventually I realized that had not properly formatted my file paths. Once I fixed the file paths, all was well and the scripts ran properly.

I found it helpful to try running my scripts from the command line before submitting them with a job file. To do this with a Python script, you need only ssh into the cluster, navigate to the directory in which your script is located, and then type "Python tmp.py" followed by a return. If your script is properly formatted, any print statements in your script will print to the terminal. If there is a problem with your script, the terminal will list the error message.

Using the cluster has allowed me to process computationally-demanding jobs very rapidly, which has in turn allowed me to continue refining my scripts quickly. I hope employing methods similar to those above can help some readers to submit their own scripts to clusters.