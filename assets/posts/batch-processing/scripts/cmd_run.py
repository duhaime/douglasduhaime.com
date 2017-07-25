#!/usr/bin/env python
#******************************************************************************
#  $Id$
# 
#  Project:  cmd_run
#  Purpose:  General program for generating model output.
#******************************************************************************

import os
import sys
import subprocess
import commands
import platform
from shlex import split as shell_tokenize

verbose=False

# determine OS
is_windows = (platform.system().lower().find("win") > -1)

# =============================================================================
def Usage():
    print('Usage: cmd.py netid [ randomized_runs ]')
    print('')
    sys.exit( 1 )
# =============================================================================

if len(sys.argv) < 2:
    Usage()

def find_basepath():
    global path
    # list only files in 'fpath' directory
    if os.environ.get('OS','') == 'Windows_NT':
        p = subprocess.Popen("echo %CD%", shell=True, stdout=subprocess.PIPE)
    else:
        p = subprocess.Popen("pwd", shell=True, stdout=subprocess.PIPE)
    out = p.stdout.read()
    if os.environ.get('OS','') == 'Windows_NT':
        path = out.rsplit("\r\n")
    else:
        path = out.rsplit("\n")
    if len(path) > 0: path = path[0]
#    print path

    return path

def is_valid_command(command):
    return_bool = False
    try:
        executable = shell_tokenize(command)[0]
    except (ValueError, IndexError): #invalid shell syntax
        pass
    try:
#        return_bool = bool(check_output(executable, stderr=subprocess.STDOUT, shell=True)) #on the PATH
        return_bool = not bool(commands.getstatusoutput('which %s' % executable)[0])
    except (CalledProcessError):
        pass
    return return_bool

def get_dir_path(fpath, dir):
    fpath = fpath.rstrip('\n')
    if not os.path.isdir(os.path.join(fpath, dir)):
        os.mkdir(os.path.join(fpath, dir))

    return os.path.join(fpath, dir)

# Lists the directories in the current path on Windows/Unix systems
def list_dirs(fpath):
    # list only directories in 'fpath' directory
    if os.environ.get('OS','') == 'Windows_NT':
        p = subprocess.Popen("dir %s /A:d /b" % fpath, shell=True, stdout=subprocess.PIPE)
    else:
        p = subprocess.Popen("ls -l %s | grep ^d | awk '{print $9}'" % fpath, shell=True, stdout=subprocess.PIPE)
    out = p.stdout.read()
#    if os.environ.get('OS','') == 'Windows_NT':
    if is_windows:
        dnames = out.rsplit("\r\n")
    else:
        dnames = out.rsplit("\n")
    if len(dnames) > 0: del dnames[-1]
#    for dname in dnames: print dname

    return dnames

# Lists the files in the current path on Windows/Unix systems
def list_files(fpath, extension=False):
    # list only files in 'fpath' directory
    if os.environ.get('OS','') == 'Windows_NT':
        p = subprocess.Popen("dir %s /A:-d /B" % fpath, shell=True, stdout=subprocess.PIPE)
        #p = subprocess.Popen("for /f \%a in ('dir %s /A:-d /b') do @echo \%~na" % fpath, shell=True, stdout=subprocess.PIPE)    // no extension
    else:
        p = subprocess.Popen("ls -l %s | grep ^- | awk '{print $9}'" % fpath, shell=True, stdout=subprocess.PIPE)
    out = p.stdout.read()
    if os.environ.get('OS','') == 'Windows_NT':
        fnames = out.rsplit("\r\n")
    else:
        fnames = out.rsplit("\n")
    if len(fnames) > 0: del fnames[-1]
    if extension == False:
        fnames = [os.path.splitext(fname)[0] for fname in fnames]
#    for fname in fnames: print fname

    return fnames

def gen_jobs(fpath, num_runs, netid):
    """Generates the SGE job files.
    :param fpath: The absolute or relative path to the base path.
    :param num_runs: The number of randomized runs.
    :param netid: The netid used as contact for SGE jobs.
    """

    run = ""
    run += "import sys\n"
    run += "import subprocess\n"
    run += "cmd_array = ("
    for i in range(num_runs):
        run += "r\"python test.py %d\"" % i
        run += ",\n"

    run += ")\n"
    run += "p = subprocess.Popen(cmd_array[int(sys.argv[1])-1], shell=True, stdout=subprocess.PIPE)\n"
    run += "out = p.stdout.read()"
#    run += "print cmd_array[int(sys.argv[1])]"

    script_name = "test"

    if verbose:
        print "Writing array script: " + "run." + script_name + ".py"
    f = open(os.path.join(fpath, "run." + script_name + ".py"), 'w')
    f.write("%s\n" % run)

    f = open(os.path.join(fpath, "submit_run." + script_name + ".sh"), 'w')
    submit_run = "#!/bin/csh\n"
    submit_run += "#$ -N %s\n" % ("job_%d" % num_runs)
    submit_run += "#$ -t 1:%d\n" % (num_runs)
    submit_run += "#$ -M %s@nd.edu\n\n" % (netid)
#    submit_run += "#$ -q short"
#    submit_run += "#$ -r y"
    submit_run += "python run.%s.py ${SGE_TASK_ID}" % (script_name)

    if verbose:
        print "Writing submit shell script: " + "submit_run." + script_name + ".sh"
    f.write("%s\n" % submit_run)

def run_jobs(num_runs):
    """Runs the SGE jobs; if the qsub command is not available, runs the commands sequentially.
    :param num_runs: The number of randomized runs.
    """

    if os.environ.get('OS','') == 'Windows_NT':
        p = subprocess.Popen("dir /A:-d /B | findstr/r \"submit_run.*.sh\"", shell=True, stdout=subprocess.PIPE)
    else:
        p = subprocess.Popen("ls -l | grep 'submit_run.*.sh' | awk '{print $9}'", shell=True, stdout=subprocess.PIPE)# list SGE submit files
    out = p.stdout.read()
    
    if os.environ.get('OS','') == 'Windows_NT':
        fnames = out.rsplit("\r\n")
    else:
        fnames = out.rsplit("\n")

    if len(fnames) > 0: del fnames[-1]

    # determine whether 'qsub' command is available
    if (is_valid_command('qsub')): # run the commands jobs using qsub
        for fname in fnames:
            p = subprocess.Popen("qsub %s" % fname, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            out = p.stderr.read()
            if verbose:
                print out
        print "Jobs submitted."
    else: # run the commands sequentially without using qsub
        print "Error: 'qsub' is an invalid command."
        if os.environ.get('OS','') == 'Windows_NT':
            p = subprocess.Popen("dir /A:-d /B | findstr/r \"run.*.py\"", shell=True, stdout=subprocess.PIPE)
        else:
            p = subprocess.Popen("ls -l | grep 'run.*.py' | awk '{print $9}'", shell=True, stdout=subprocess.PIPE) # list SGE submit files
        out = p.stdout.read()

        if os.environ.get('OS','') == 'Windows_NT':
            fnames = out.rsplit("\r\n")
        else:
            fnames = out.rsplit("\n")
        if len(fnames) > 0: del fnames[-1]

        for fname in fnames:
            for i in range(num_runs):
                if verbose:
                    print "Executing command: python %s %d" % (fname, i)
                p = subprocess.Popen("python %s %d" % (fname, i), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            out = p.stderr.read()
            if verbose:
                print out

def del_jobs():
    """Deletes the SGE jobs files."""

    # find Python run scripts and shell submit scripts
    if os.environ.get('OS','') == 'Windows_NT':
        p1 = subprocess.Popen("dir /A:-d /B | findstr/r \"run[.].*[.]py\"", shell=True, stdout=subprocess.PIPE) # list Python run files
        p2 = subprocess.Popen("dir /A:-d /B | findstr/r \"submit_run[.].*[.]sh\"", shell=True, stdout=subprocess.PIPE) # list SGE submit files
    else:
        p1 = subprocess.Popen("ls -l | grep 'run[.].*[.]py' | awk '{print $9}'", shell=True, stdout=subprocess.PIPE) # list Python run files
        p2 = subprocess.Popen("ls -l | grep 'submit_run[.].*[.]sh' | awk '{print $9}'", shell=True, stdout=subprocess.PIPE) # list SGE submit files
    out1 = p1.stdout.read()
    out2 = p2.stdout.read()

    if os.environ.get('OS','') == 'Windows_NT':
        fnames1 = out1.rsplit("\r\n")
        fnames2 = out2.rsplit("\r\n")
    else:
        fnames1 = out1.rsplit("\n")
        fnames2 = out2.rsplit("\n")
    if len(fnames1) > 0: del fnames1[-1]
    if len(fnames2) > 0: del fnames2[-1]

    fnames = fnames1 + fnames2
    for fname in fnames:
        if verbose:
            print "Removing '%s'" %fname
        os.remove(fname)

    # find and delete SGE output files
    if os.environ.get('OS','') != 'Windows_NT':
        p = subprocess.Popen("ls -l | egrep '*.o[0-9]{4,8}[.][0-9]+$' | awk '{print $9}'", shell=True, stdout=subprocess.PIPE) # list SGE output files
        out = p.stdout.read()
        fnames = out.rsplit("\n")
        if len(fnames) > 0: del fnames[-1]
        
        for fname in fnames:
#            if verbose:
            print "Removing '%s'" %fname
            os.remove(fname)

#
# Program mainline.
#
def __main__():
    global is_windows

    num_runs = 10 # number of randomized runs

    # Parse command line arguments.
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if i == 1:
            netid = arg
        elif i == 2:
            if int(arg) > 0:
                num_runs = int(arg)
        i = i + 1

    bpath = find_basepath().rstrip('\n')
    gen_jobs(bpath, num_runs, netid)
    run_jobs(num_runs)
#    del_jobs()

__main__()