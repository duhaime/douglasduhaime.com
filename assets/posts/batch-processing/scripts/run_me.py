#!/usr/bin/env python
#******************************************************************************
#  $Id$
# 
#  Project:  _run_me
#  Purpose:  A generic script that sets the PYTHONPATH environmental variable,
#            loads the Intel module (needed by NUMPY/SCIPY), and executes
#            a subsequent Python script.
#
#  Example usage: python _run_me.py cmd_species.py rjohns15 70 10
#******************************************************************************

import sys
import os

# =============================================================================
def Usage():
    print('Usage: run_me script netid [ miscellaneous_commands ]')
    sys.exit( 1 )
# =============================================================================

if len(sys.argv) < 3:
    Usage()

#
# Program mainline.
#
def __main__():
	script = ""
	netid = ""
	commands = ""
	
	# Parse command line arguments.
	i = 1
	while i < len(sys.argv):
		arg = sys.argv[i]
		if i == 1:
			script = arg
		elif i == 2:
			netid = arg
		elif i >= 3:
			commands += " %s" % arg
		i = i + 1

	#set the PYTHONPATH environmental variable
	os.environ["PYTHONPATH"] = os.path.join(os.environ["HOME"], "local_python_packages/lib64/python/")
	
	#load the Intel module
	cmd = os.popen("/afs/crc.nd.edu/x86_64_linux/Modules/3.2.8/bin/modulecmd python load intel")
	exec(cmd)
	
	#run script
	print "Command executed:  python %s %s%s" % (script, netid, commands)
	os.system("python %s %s%s" % (script, netid, commands))
	
__main__()