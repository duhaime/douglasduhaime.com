import sys

#
# Program mainline.
#
def __main__():
    num_runs = 0

    # Parse command line arguments.
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if i == 1:
            num_runs = int(arg)

        i += 1

    string = ""
    for i in range(num_runs):
        string += "%d\n" % int(i+1)

    f = open("test." + str(num_runs) + ".txt", 'w')
    f.write("%s\n" % string)
    f.close()

__main__()