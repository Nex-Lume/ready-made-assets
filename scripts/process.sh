#!/usr/bin/env bash
# Builds web-ready media from raw Google Flow downloads.
# Usage: SRC=/path/to/raw OUT=/tmp/media scripts/process.sh
set -e
SRC=${SRC:-assets}; OUT=${OUT:-media}
mkdir -p $OUT/hero $OUT/v $OUT/img
# delogo boxes measured on 1080p renders: "Veo" text bottom-right + copied sparkle
DL="delogo=x=1830:y=1020:w=85:h=50,delogo=x=1690:y=860:w=140:h=130"
declare -A HERO=( [biryani]=Biryani_rising [butter-chicken]=Makhani_gravy [tandoori]=Chicken_leg [seekh]=Ghee_falls [paneer]=Paneer_tikka_ingredients [dal]=Ingredients_splashing [naan]=Butter_dripping [lassi]=Mango_lassi_splashing )
declare -A LOOP=( [spices]=Spices_floating [ingredients]=Ingredients_falling [gravy-pour]=Ghee_and_gravy [steam]=Steam_rising [storefront]=People_chatting )
declare -A IMG=( [handi-dum]=Copper_biryani [butter-chicken]=Butter_chicken [tandoori]=Tandoori_chicken [seekh]=Lamb_seekh [paneer]=Paneer_tikka_on [dal]=Dal_makhani [naan]=Garlic_butter [lassi]=Glass_of_mango [feast]=Biryani_and_kebabs [embers]=Charcoal_glowing )
src(){ ls $SRC/$1*.${2} | head -1; }
KF="-x264-params keyint=2:min-keyint=1:scenecut=0:bframes=0"
for k in "${!HERO[@]}"; do f=$(src ${HERO[$k]} mp4)
 ffmpeg -v error -y -i "$f" -an -vf "$DL,scale=1280:-2" -c:v libx264 -crf 26 -preset fast $KF -pix_fmt yuv420p -movflags +faststart $OUT/hero/$k.mp4 &
 ffmpeg -v error -y -i "$f" -an -vf "$DL,scale=720:-2" -c:v libx264 -crf 27 -preset fast $KF -pix_fmt yuv420p -movflags +faststart $OUT/hero/$k-m.mp4 &
 ffmpeg -v error -y -i "$f" -an -vf "$DL,scale=1280:-2" -c:v libx264 -crf 26 -preset fast -pix_fmt yuv420p -movflags +faststart $OUT/v/$k.mp4 &
 wait; done
for k in "${!LOOP[@]}"; do f=$(src ${LOOP[$k]} mp4)
 filter="$DL"
 if [[ "$k" == ingredients ]]; then filter="$filter,delogo=x=35:y=15:w=145:h=85"; fi
 if [[ "$k" == storefront ]]; then filter="$filter,delogo=x=1630:y=22:w=225:h=90,delogo=x=375:y=145:w=115:h=105"; fi
 ffmpeg -v error -y -i "$f" -an -vf "$filter,scale=1280:-2" -c:v libx264 -crf 26 -preset fast -pix_fmt yuv420p -movflags +faststart $OUT/v/$k.mp4; done
for f in $OUT/v/*.mp4; do ffmpeg -v error -y -i $f -frames:v 1 -q:v 4 ${f%.mp4}.jpg; done
for k in "${!IMG[@]}"; do f=$(src ${IMG[$k]} jpg)
 W=$(ffprobe -v error -show_entries stream=width -of csv=p=0 "$f"); H=$(ffprobe -v error -show_entries stream=height -of csv=p=0 "$f")
 ffmpeg -v error -y -i "$f" -vf "delogo=x=$((W*890/1000)):y=$((H*835/1000)):w=$((W*70/1000)):h=$((H*80/1000))" -quality 82 $OUT/img/$k.webp; done
du -sh $OUT
