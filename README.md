# HTTP-Protocol-Reconstruction
Manually reconstruction of HTTP protocol with terminal commands with hping3 and NeonCat

# Requirements

Project intended for windows OS, using CMD for execution with Node.js

Required to have WSL installed, and within the given linux, have hping3 and nc installed aswell

Lastly, modify permissions for hping3 to be succeptible to automated sudo commands through
entering the WSL linux and adding "root ALL=(ALL) NOPASSWD: /usr/bin/hping3" to the sudo 
visudo file. This can be done with:

bash
sudo visudo

then add the line
