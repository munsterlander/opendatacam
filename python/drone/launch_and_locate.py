import math

def getSquareRoot(passedValue):
    return math.sqrt(passedValue)

def main():
    #process command line arguments
    passedValue = 0
    # call fun()
    res = getSquareRoot(passedValue)
    print(res)

if __name__ == "__main__":
    main()