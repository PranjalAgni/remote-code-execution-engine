export const commandMap = {
    javascript: "node ./code.js",
    python: "python ./code.py",
    c: "gcc -o code.out ./code.c && ./code.out",
    cpp: "g++ -o code.out ./code.cpp && ./code.out",
    java: "javac code.java && java ./code",
    golang: "go run code.go"
};