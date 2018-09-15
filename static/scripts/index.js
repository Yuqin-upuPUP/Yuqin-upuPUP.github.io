


// 微信浏览器阻止页面拖动----------------------------------------------------------------------------------
document.body.addEventListener('touchmove' , function(e){
  e.preventDefault(); 
})
// ----------------------------------------------------------------------------------微信浏览器阻止页面拖动
document.getElementById('restartBtn').onclick = function(e) {
  e.preventDefault(); 
  jeu.niveaux = JSON.parse(JSON.stringify(originMap)); 
  jeu.niveauActuel = 0; 
  jeu.enPause = false; 
  jeu.score = 0; 
  jeu.chargement('restart'); 
  e.target.style.visibility = 'hidden'; 
  document.getElementById('recruitBtn').style.visibility = 'hidden'; 
}; 

document.getElementById('recruitBtn').onclick = function(e) {
  e.preventDefault(); 
  window.location.href = 'https://mp.weixin.qq.com/s/oxQITajpb_rVDOI29gxr1Q'; 
}


var shiftBtn = {
  left: 0, 
  top: 0, 
}; 



Calcul = {}; 
Calcul.entre = function(valeur, min, max) {
  return (valeur - min) * (valeur - max) < 0; 
}; 
Calcul.aleatoire = function(min, max) {
  return min + Math.random() * (max - min); 
}; 
Calcul.distance = function(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y); 
}; 
Calcul.lerp = function(value1, value2, amount) {
  return value1 + (value2 - value1) * amount; 
}; 
Calcul.pointCarre = function(x, y, carre) {
  return Calcul.entre(x, carre.pos.x, carre.pos.x + carre.taille) && Calcul.entre(y, carre.pos.y, carre.pos.y + carre.taille); 
}; 
var utils = {
  aleatoire: function(min, max) {
    return min + Math.random() * (max - min); 
  }, 
  aleatoireA: function(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1)); 
  }, 
  morceler: function(tableau, largeur) {
    var resultat = []; 
    for (var i = 0; i < tableau.length; i += largeur) resultat.push(tableau.slice(i, i + largeur))
    return resultat; 
  }, 
  tablifier: function(tableau, largeur) {
    var resultat = []; 
    for (var i = 0; i < tableau.length; i += largeur) resultat.push(tableau.slice(i, i + largeur))
    document.write(JSON.stringify(resultat) + '<hr>'); 
  }, 
}; 

/*
  __  __           _       _           
 |  \/  |         | |     | |          
 | \  / | ___   __| |_   _| | ___  ___ 
 | |\/| |/ _ \ / _` | | | | |/ _ \/ __|
 | |  | | (_) | (_| | |_| | |  __/\__ \
 |_|  |_|\___/ \__,_|\__,_|_|\___||___/
                                       
*/
// la bille est influencée par l'inclinaison du terrain 球受到地面倾斜的影响
class Camera {
  constructor(parent, cible) {
    this.parent = parent; 
    this.ctx = parent.ctx; 
    this.cible = cible; 
    this.pos = {
      x: this.cible.pos.x, 
      y: this.cible.pos.y
    }; 
    this.vel = {
      x: 0, 
      y: 0
    }; 
    this.force = {
      x: 0, 
      y: 0
    }; 
    this.facteur = {
      x: 0.1, 
      y: 0.1
    }; 
    this.traine = 0.1; 
  }; 
  rendu() {
    this.force.y = this.cible.pos.y - this.pos.y; 
    this.force.y *= this.facteur.y; 
    this.force.x = this.cible.pos.x - this.pos.x; 
    this.force.x *= this.facteur.x; 
    this.vel.x *= this.traine; 
    this.vel.y *= this.traine; 
    this.vel.x += this.force.x; 
    this.vel.y += this.force.y; 
    this.pos.x += this.vel.x; 
    this.pos.y += this.vel.y; 
  }
}

class Bille {
  constructor(parent, x, y) {
    this.parent = parent; 
    this.vitesse = 0; 
    this.angle = 0; 
    this.taille = parent.taille; 
    this.depart = {
      x: x, 
      y: y
    }; 
    this.pos = {
      x: x, 
      y: y
    }; 
    this.vel = {
      x: 0, 
      y: 0
    }; 
    this.friction = 0.99; 
    this.force = parent.force; 
    this.ctx = parent.ctx; 
    this.limite = {
      x: parent.L, 
      y: parent.H
    }; 
    this.apparition = true; 
    this.mort = false; 
    this.sprite = new Sprite(this, parent.ressources.bille); 
    this.particules = new Generateur(this, 30, parent.ressources.herbe); 
    this.scale = 0; 
  }
  dessiner() {
    this.ctx.save(); 
    this.ctx.translate(this.pos.x, this.pos.y); 
    if (this.mort) {
      this.ctx.scale(this.scale, this.scale); 
      if (this.scale > 0.1) {
        this.scale -= 0.05; 
      } else {
        this.pos.x = this.depart.x; 
        this.pos.y = this.depart.y; 
        this.vel.x = 0; 
        this.vel.y = 0; 
        this.mort = false; 
        this.apparition = true; 
      }
    }
    if (this.apparition) {
      this.ctx.scale(this.scale, this.scale); 
      if (this.scale < 1) {
        this.scale += 0.05; 
      } else {
        this.scale = 1; 
        this.apparition = false; 
      }
    }
    this.ctx.rotate(this.angle); 
    this.sprite.rendu(); 
    this.ctx.restore(); 
    this.sprite.allure = (this.vitesse) / 10; 
  }
  integration() {
    this.vel.x *= this.friction; 
    this.vel.y *= this.friction; 
    this.vel.x += this.force.x; 
    this.vel.y += this.force.y; 
    this.pos.x += this.vel.x; 
    this.pos.y += this.vel.y; 
    if (this.pos.x < 0) {
      this.pos.x = 0; 
      this.vel.x *= -0.4; 
    }
    if (this.pos.x > this.limite.x) {
      this.pos.x = this.limite.x; 
      this.vel.x *= -0.4; 
    }
    if (this.pos.y < 0) {
      this.pos.y = 0; 
      this.vel.y *= -0.4; 
    }
    if (this.pos.y > this.limite.y) {
      this.pos.y = this.limite.y; 
      this.vel.y *= -0.4; 
    }
    this.vitesse = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y); 
    this.angle = Math.atan2(this.vel.y, this.vel.x); 
  }
  collision() {
    if (this.pos.x < this.taille * 1) {
      this.pos.x = this.taille * 1; 
    }
    if (this.pos.y < this.taille * 1) {
      this.pos.y = this.taille * 1; 
    }
    if (this.pos.x > (this.parent.terrain.dimension.x - 1) * this.taille) {
      this.pos.x = (this.parent.terrain.dimension.x - 1) * this.taille; 
    }
    if (this.pos.y > (this.parent.terrain.dimension.y - 1) * this.taille) {
      this.pos.y = (this.parent.terrain.dimension.y - 1) * this.taille; 
      this.vel.y = 0; 
    }
    var tX = this.pos.x + this.vel.x; 
    var tY = this.pos.y + this.vel.y; 
    var offset = (this.taille / 2) - 1; 
    let tuileActive = this.parent.infoCollision(tX, tY); 
    if (tuileActive.action) {
      this.parent.action(tuileActive.action, tuileActive.pos); 
    }
    // gauche 左
    var gauche1 = this.parent.infoCollision(tX - this.taille / 2, this.pos.y - offset); 
    var gauche2 = this.parent.infoCollision(tX - this.taille / 2, this.pos.y + offset); 
    if (gauche1.collision || gauche2.collision) {
      this.pos.x = gauche1.pos.x + this.taille + offset + 1; 
      this.pos.x = gauche2.pos.x + this.taille + offset + 1; 
      this.vel.x *= -0.2; 
    }
    // Droite 权(右?)
    var droite1 = this.parent.infoCollision(tX + this.taille / 2, this.pos.y - offset); 
    var droite2 = this.parent.infoCollision(tX + this.taille / 2, this.pos.y + offset); 
    if (droite1.collision || droite2.collision) {
      this.pos.x = droite1.pos.x - this.taille + offset; 
      this.pos.x = droite2.pos.x - this.taille + offset; 
      this.vel.x *= -0.2; 
    }
    // Bas 低
    var bas1 = this.parent.infoCollision(this.pos.x - offset, tY + this.taille / 2); 
    var bas2 = this.parent.infoCollision(this.pos.x + offset, tY + this.taille / 2); 
    if (bas1.collision || bas2.collision) {
      this.pos.y = bas1.pos.y - offset - 1; 
      this.pos.y = bas2.pos.y - offset - 1; 
      this.vel.y *= -0.2; 
      this.saut = false; 
    }
    // Haut
    var haut1 = this.parent.infoCollision(this.pos.x - offset, tY - this.taille / 2); 
    var haut2 = this.parent.infoCollision(this.pos.x + offset, tY - this.taille / 2); 
    if (haut1.collision || haut2.collision) {
      this.pos.y = haut1.pos.y + this.taille + offset + 1; 
      this.pos.y = haut2.pos.y + this.taille + offset + 1; 
      this.vel.y *= -0.2; 
    }
  }
  rendu() {
    this.particules.rendu(); 
    this.dessiner(); 
    if (!this.mort) {
      this.collision(); 
      this.integration(); 
    }
  }
}

class PikkuX {
  constructor(parent, x, y) {
    this.parent = parent; 
    this.cible = parent.joueur; 
    this.taille = parent.taille; 
    this.depart = {
      x: x, 
      y: y
    }
    this.pos = {
      x: x, 
      y: y
    }
    this.vel = {
      x: 0, 
      y: 0
    }
    this.friction = 0.99; 
    this.force = parent.force; 
    this.ctx = parent.ctx; 
    this.limite = {
      x: parent.L, 
      y: parent.H
    }; 
    this.sprite = new Sprite(this, parent.ressources.pikkux); 
    this.sprite.animation = false; 
  }
  dessiner() {
    this.ctx.save(); 
    this.ctx.translate(this.pos.x + this.taille / 2, this.pos.y + this.taille / 2); 
    this.sprite.rendu(); 
    this.ctx.restore(); 
  }
  integration() {
    this.vel.x *= this.friction; 
    this.vel.x += this.force.x; 
    this.pos.x += this.vel.x; 
    if (this.pos.x < 0) {
      this.pos.x = 0; 
      this.vel.x *= -0.4; 
    }
    if (this.pos.x > this.limite.x) {
      this.pos.x = this.limite.x; 
      this.vel.x *= -0.4; 
    }
    if (this.pos.y < 0) {
      this.pos.y = 0; 
      this.vel.y *= -0.4; 
    }
    if (this.pos.y > this.limite.y) {
      this.pos.y = this.limite.y; 
      this.vel.y *= -0.4; 
    }
  }
  collision() {
    let tX = this.pos.x + this.vel.x; 
    let tY = this.pos.y + this.vel.y; 
    let tuileGauche = this.parent.infoCollision(tX, tY); 
    if (tuileGauche.collision) {
      this.vel.x *= -0.3; 
      this.pos.x = tuileGauche.pos.x + this.taille; 
    }
    let tuileDroite = this.parent.infoCollision(tX + this.taille, tY); 
    if (tuileDroite.collision) {
      this.vel.x *= -0.3; 
      this.pos.x = tuileDroite.pos.x - this.taille; 
    }
  }
  attaque() {
    if (Calcul.pointCarre(this.cible.pos.x, this.cible.pos.y, this)) {
      this.parent.action('mort'); 
    }
  }
  rendu() {
    this.dessiner(); 
    this.integration(); 
    this.collision(); 
    this.attaque(); 
  }
}

class PikkuY {
  constructor(parent, x, y) {
    this.cible = parent.joueur; 
    this.parent = parent; 
    this.taille = parent.taille; 
    this.depart = {
      x: x, 
      y: y
    }
    this.pos = {
      x: x, 
      y: y
    }
    this.vel = {
      x: 0, 
      y: 0
    }
    this.friction = 0.99; 
    this.force = parent.force; 
    this.ctx = parent.ctx; 
    this.limite = {
      x: parent.L, 
      y: parent.H
    }; 
    this.sprite = new Sprite(this, parent.ressources.pikkuy); 
    this.sprite.animation = false; 
  }
  dessiner() {
    this.ctx.save(); 
    this.ctx.translate(this.pos.x + this.taille / 2, this.pos.y + this.taille / 2); 
    this.sprite.rendu(); 
    this.ctx.restore(); 
  }
  integration() {
    this.vel.y *= this.friction; 
    this.vel.y += this.force.y; 
    this.pos.y += this.vel.y; 
    if (this.pos.x < 0) {
      this.pos.x = 0; 
      this.vel.x *= -0.4; 
    }
    if (this.pos.x > this.limite.x) {
      this.pos.x = this.limite.x; 
      this.vel.x *= -0.4; 
    }
    if (this.pos.y < 0) {
      this.pos.y = 0; 
      this.vel.y *= -0.4; 
    }
    if (this.pos.y > this.limite.y) {
      this.pos.y = this.limite.y; 
      this.vel.y *= -0.4; 
    }
  }
  collision() {
    var tX = this.pos.x + this.vel.x; 
    var tY = this.pos.y + this.vel.y; 
    let tuileBas = this.parent.infoCollision(tX, tY + this.taille); 
    if (tuileBas.collision) {
      this.vel.y *= -0.3; 
      this.pos.y = tuileBas.pos.y - this.taille; 
    }
    let tuileHaut = this.parent.infoCollision(tX, tY); 
    if (tuileHaut.collision) {
      this.vel.y *= 0.3; 
      this.pos.y = tuileHaut.pos.y + this.taille; 
    }
  }
  attaque() {
    if (Calcul.pointCarre(this.cible.pos.x, this.cible.pos.y, this)) {
      this.parent.action('mort'); 
    }
  }
  rendu() {
    this.dessiner(); 
    this.integration(); 
    this.collision(); 
    this.attaque(); 
  }
}

class Sprite {
  constructor(parent, donnee) {
    this.parent = parent; 
    this.ctx = this.parent.ctx; 
    this.donnee = donnee; 
    this.l = Math.round(this.donnee.l / this.donnee.sep); 
    this.h = this.donnee.h / this.donnee.ligne; 
    this.image = this.donnee.img; 
    this.ligne = 0; 
    this.longueur = this.donnee.sep; 
    this.selectLigne = this.h / this.donnee.ligne * this.ligne; 
    // animation 动画
    this.frame = 0; 
    this.allure = donnee.allure; 
    this.animation = true; 
  }
  changeLigne(selection) {
    this.ligne = selection; 
    this.selectLigne = this.h * this.ligne; 
  }
  reset() {
    this.frame = 0; 
  }
  animer() {
    if (this.animation) {
      this.frame += this.allure; 
      if (this.frame >= this.longueur - 1) {
        this.frame = 0; 
      }
    }
  }
  rendu() {
    this.animer(); 
    this.ctx.drawImage(this.image, Math.floor(this.frame) * this.l, this.selectLigne, this.l, this.h, -this.parent.taille / 2, -this.parent.taille / 2, this.l, this.h); 
  }
}

class Particule {
  constructor(x, y, vitesse, angle, image, ctx) {
    this.pos = {
      x: x, 
      y: y
    }; 
    this.vel = {
      x: 0, 
      y: -2
    }; 
    this.friction = 0.8; 
    this.longevite = Calcul.aleatoire(1, 20); 
    this.mort = false; 
    this.image = image; 
    this.ctx = ctx; 
    this.setHeading(Calcul.aleatoire(angle - 0.2, angle + 0.2)); 
    this.setSpeed(vitesse); 
  }
  setHeading(heading) {
    var speed = this.getSpeed(); 
    this.vel.x = Math.cos(heading) * speed; 
    this.vel.y = Math.sin(heading) * speed; 
  }
  getHeading() {
    return Math.atan2(this.vel.y, this.vel.x); 
  }
  setSpeed(speed) {
    let heading = this.getHeading(); 
    this.vel.x = Math.cos(heading) * speed; 
    this.vel.y = Math.sin(heading) * speed; 
  }
  getSpeed() {
    return Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y); 
  }
  dessiner() {
    this.ctx.globalAlpha = this.longevite; 
    this.ctx.drawImage(this.image.img, this.pos.x, this.pos.y); 
    this.ctx.globalAlpha = 1; 
  }
  integration() {
    if (this.longevite > 0.2 && !this.mort) {
      this.longevite -= 0.1; 
    } else {
      this.mort = true; 
    }
    this.vel.x *= this.friction; 
    this.vel.y *= this.friction; 
    this.pos.x += this.vel.x; 
    this.pos.y += this.vel.y; 
  }
  rendu() {
    this.dessiner(); 
    this.integration(); 
  }
}

class Generateur {
  constructor(parent, nombre, image) {
    this.parent = parent; 
    this.pos = {
      x: this.parent.pos.x, 
      y: this.parent.pos.y
    }
    this.particules = []; 
    for (var i = 0; i < nombre; i++) {
      this.particules.push(new Particule(this.pos.x, this.pos.y, this.parent.vitesse, this.parent.angle, image, this.parent.ctx)); 
    }
  }
  rendu() {
    for (var i = this.particules.length - 1; i >= 0; i--) {
      if (!this.particules[i].mort) {
        this.particules[i].rendu(); 
      } else {
        this.particules[i].longevite = Calcul.aleatoire(1, 20); 
        this.particules[i].mort = false; 
        this.particules[i].pos.x = this.parent.pos.x; 
        this.particules[i].pos.y = this.parent.pos.y; 
        this.particules[i].setSpeed(this.parent.vitesse + 2); 
        this.particules[i].setHeading(Calcul.aleatoire(-this.parent.angle - 1, -this.parent.angle + 1)); 
      }
    }
  }
}

/*
   _____                      
  / ____|                     
 | |     ___   ___ _   _ _ __ 
 | |    / _ \ / _ \ | | | '__|
 | |___| (_) |  __/ |_| | |   
  \_____\___/ \___|\__,_|_|   
                              
*/
// 迷宫
class Labirynthe {
  constructor(parametres, niveaux) {
    this.niveaux = niveaux; 
    this.niveauActuel = 0; 
    this.taille = parametres.taille; 
    this.curseur = {
      pos: {
        x: 0, 
        y: 0
      }, 
      cliquePos: {
        x: 0, 
        y: 0
      },
      active: false, 
    }; 
    this.creerContexte();
    this.force = {
      x: 0, 
      y: 0
    }; 
    // on charge les images 我们加载图像
    // Nombre d'images à charger dans le pack :B 包装中要加载的图像数量：B
    this.prop = {
      compte: 0, 
      nombreImg: parametres.packImages.length
    }; 
    this.traitement(parametres.packImages, parametres.clefs);
    this.enPause = false; 
    this.tableau = {
      friction: 0.8, 
      vel: {
        x: 0, 
        y: 0
      }, 
    }
    this.score = 0; 
    this.ennemis = []; 
  }
  // 装载
  chargement(type) {
    if (type == 'restart') {
      this.prop.compte = 7; 
    } else{
      this.prop.compte += 1; 
    };
    
    if (this.prop.compte === this.prop.nombreImg) {  // les images sont chargées 图像已加载
      this.ctx.fillRect(0, 0, this.L, this.H); 
      this.chargerTerrain(); 
      document.getElementById('instruction').style.visibility = 'visible'; 
      document.getElementById('shiftBtn').style.visibility = 'visible'; 
      document.getElementById('shiftBtnBg').style.visibility = 'visible'; 
    } else {
      this.ctx.fillStyle = 'white'; 
      this.ctx.fillRect(0, 0, this.L, this.H); 
      this.ctx.fillStyle = 'black'; 
      this.ctx.textAlign = 'center'; 
      this.ctx.font = '20px Arial'; 
      this.ctx.fillText('加载中 ', this.L / 2, this.H / 2); 
      this.ctx.font = '12px Arial'; 
      this.ctx.fillText(this.prop.compte + ' / ' + this.prop.nombreImg, this.L / 2, this.H / 2 + 20); 
      this.ctx.fillRect(0, this.H - 150, (this.prop.compte / this.prop.nombreImg) * 500, 5); 
    }
  }
  // 加载图片
  chargerImages(url) {
    let img = new Image(); 
    let self = this; 
    img.onload = function() {
      self.chargement(); 
    }; 
    img.src = url; 
    return img; 
  }
  traitement(packImages, clefs) {
    // traitement images 图像处理
    let IM = {}; 
    for (let i = 0; i < packImages.length; i++) {
      let sujet = packImages[i]; 
      let nom = sujet.nom; 
      sujet.img = this.chargerImages(packImages[i].img); 
      IM[nom] = packImages[i]; 
    }
    this.ressources = IM; 
    //  traitement clefs 关键治疗
    this.nettoyer = new Array(clefs.length).fill(false); 
    let CM = {}; 
    for (let i = 0; i < clefs.length; i++) {
      let sujet = clefs[i]; 
      let nom = sujet.id; 
      if (sujet.type === 'sprite') {
        sujet.frame = 0; 
        sujet.longueur = this.ressources[sujet.apparence].l; 
        sujet.sprite = this.ressources[sujet.apparence]; 
        sujet.memoireBoucle = false; 
      }
      CM[nom] = clefs[i]; 
    }
    this.clefs = CM; 
  }
  // 创建上下文
  creerContexte() {
    this.toile = document.createElement('canvas'); 
    this.toile.setAttribute('id', 'canvasDom'); 
    this.ctx = this.toile.getContext('2d'); 
    this.L = this.toile.width = 760; 
    this.H = this.toile.height = 1120; 
    this.ctx.mozImageSmoothingEnabled = false; 
    this.ctx.msImageSmoothingEnabled = false; 
    this.ctx.imageSmoothingEnabled = false; 
    document.body.appendChild(this.toile); 
    // curseur
    // 使方向按钮背景、方向按钮位于 canvas 中央
    this.curseur.efCorps = document.getElementById('shiftBtnBg'); 
    document.getElementById('shiftBtnBg').style.top = (this.toile.offsetHeight - this.curseur.efCorps.offsetHeight) / 2 + this.toile.offsetTop + 'px'; 
    this.curseur.distCorps = document.getElementById('shiftBtn'); 
    document.getElementById('shiftBtn').style.top = (this.toile.offsetHeight - this.curseur.distCorps.offsetHeight) / 2 + this.toile.offsetTop + 'px'; 
    // 设置重玩按钮和招新推送按钮绝对定位时的上边距
    var finalBtnInterval = 60; 
    var restartBtn = document.getElementById('restartBtn'); 
    restartBtn.style.top = this.toile.offsetTop + this.toile.offsetHeight * 0.625 + 'px'; 
    var recruitBtn = document.getElementById('recruitBtn'); 
    recruitBtn.style.top = this.toile.offsetTop + this.toile.offsetHeight * 0.625 + restartBtn.offsetHeight + finalBtnInterval + 'px'; 

    // 保存拖动按钮的上边距与左边距
    shiftBtn.left = document.getElementById('shiftBtn').offsetLeft; 
    shiftBtn.top = document.getElementById('shiftBtn').offsetTop; 
    //controles

    // var addHandler = function(element, type, handler){
    //   if (element.addEventListener){
    //     element.addEventListener(type, handler, false); 
    //   } else if (element.attachEvent){
    //     element.attachEvent('on' + type, handler); 
    //   } else {
    //     element['on' + type] = handler; 
    //   }
    // }
    var movestart = 'ontouchstart' in document ? 'touchstart' : 'mousedown' ; 
    var moveing = 'ontouchmove' in document ? 'touchmove' : 'mousemove' ; 
    var movestop = 'ontouchend' in document ? 'touchend' : 'mouseup' ; 

    // addHandler(document,move,function(e){
    //   var ev = 'ontouchmove' in document ? e.touches[0] : e ; 
    //   var x = ev.pageX;   // 这样就能在PC 和 手机上都拿到坐标值了
    //   console.log(x); 
    // }); 

    document.body.addEventListener(moveing, event => this.curseurActif(event), false); 
    document.body.addEventListener(movestart, event => this.curseurEnfonce(event), false); 
    document.body.addEventListener(movestop, event => this.curseurLeve(event), false); 
  }
  curseurEnfonce(e) {
    // 所有 e 用 ev 代替
    var ev = 'ontouchmove' in document ? e.touches[0] : e; 
    this.curseur.active = true; 
  }
  curseurLeve() {
    this.curseur.active = false; 
    this.curseur.distCorps.style.left = shiftBtn.left + 'px'; 
    this.curseur.distCorps.style.top = shiftBtn.top + 'px'; 
    this.force.x = 0; 
    this.force.y = 0; 
  }
  curseurActif(e) {
    // 所有 e 用 ev 代替
    var ev = 'ontouchmove' in document ? e.touches[0] : e; 
    this.curseur.pos.x = ev.pageX; 
    this.curseur.pos.y = ev.pageY; 
    if (this.curseur.active) {
      let origine_x = shiftBtn.left, 
        origine_y = shiftBtn.top, 
        radius = 100, 
        x0 = this.curseur.pos.x - origine_x, 
        y0 = this.curseur.pos.y - origine_y, 
        distance0 = Math.sqrt(x0 * x0 + y0 * y0), 
        distance = Math.min(distance0, radius), 
        distance_mult; 
      if (distance0 > radius) {
        distance_mult = distance / distance0; 
      } else {
        distance_mult = 1; 
      }
      let newX = origine_x + distance_mult * x0; 
      let newY = origine_y + distance_mult * y0; 
      this.curseur.distCorps.style.left = newX + 'px'; 
      this.curseur.distCorps.style.top = newY + 'px'; 
      this.force.x = (newX - origine_x) / 200; 
      this.force.y = (newY - origine_y) / 200; 
    }
  }
  // 加载地形
  chargerTerrain() {
    this.terrain = this.niveaux[this.niveauActuel]; 
    this.terrain.dimension = {
      x: this.terrain.geometrie[0].length, 
      y: this.terrain.geometrie.length
    };
    this.terrain.apparence = []; 
    this.calculerApparence(); 
    // on genere le terrain 我们创造了基础
    // et on indique ou sera positionné le joueur 我们指示或将定位玩家
    this.depart = this.chercheClef('depart')[0]; 
    this.joueur = new Bille(this, this.depart.pos.x + this.taille / 2, this.depart.pos.y + this.taille / 2); 
    this.joueur.sprite.frame = 8; 
    this.camera = new Camera(this, this.joueur);
    // on ajoute les ennemis s'ils y en a 我们添加敌人，如果有的话
    this.ennemis = []; 
    let pikkuxDep = this.chercheClef('xAxe'); 
    for (var i = 0; i < pikkuxDep.length; i++) {
      this.ennemis.push(new PikkuX(this, pikkuxDep[i].pos.x, pikkuxDep[i].pos.y)); 
    }
    let pikkuyDep = this.chercheClef('yAxe');
    for (var i = 0; i < pikkuyDep.length; i++) {
      this.ennemis.push(new PikkuY(this, pikkuyDep[i].pos.x, pikkuyDep[i].pos.y)); 
    }
    // quand tout est chargé on peut lancer le jeu 当一切都被加载后我们可以开始游戏
    if (this.animation) {
    } else {
      this.boucle(); 
    }
  }
  infoCollision(x, y) {
    if (x > 0 && y > 0 && y < this.terrain.dimension.y * this.taille && x < this.terrain.dimension.x * this.taille) {
      let NewX = Math.floor(x / this.taille); 
      let NewY = Math.floor(y / this.taille); 
      let NClef = this.terrain.geometrie[NewY][NewX]; 
      let info = {
        collision: this.clefs[NClef].collision, 
        pente: this.clefs[NClef].pente, 
        action: this.clefs[NClef].action, 
        pos: {
          x: NewX * this.taille, 
          y: NewY * this.taille
        }
      };
      return info; 
    } else {
      return false; 
    }
  }
  coordonner(x, y) {
    let NewX = Math.floor(x / this.taille); 
    let NewY = Math.floor(y / this.taille); 
    return {
      x: NewX, 
      y: NewY
    };
  }
  chercheClef(recherche) {
    let blockRecherche = []; 
    for (var j = 0; j < this.terrain.dimension.y; j++) {
      for (var i = 0; i < this.terrain.dimension.x; i++) {
        let id = this.terrain.geometrie[j][i]; 
        if (this.clefs[id].nom === recherche) {
          let info = {
            pos: {
              x: i * this.taille, 
              y: j * this.taille
            }
          }
          blockRecherche.push(info); 
        }
      }
    }
    return blockRecherche; 
  }
  // 计算外观
  calculerApparence() {
    let tuileBitMask = []; 
    let compte = 0; 
    this.terrain.apparence = []; 
    for (var j = 0; j < this.terrain.dimension.y; j++) {
      for (var i = 0; i < this.terrain.dimension.x; i++) {
        let id = this.terrain.geometrie[j][i]; 
        // haut gauche droit bas 左上角右下角
        let voisine = [0, 0, 0, 0]; 
        compte += 1; 
        if (j - 1 > -1) {
          if (id === this.terrain.geometrie[j - 1][i]) {
            //haut 顶
            voisine[0] = 1; 
          }
        }
        if (id === this.terrain.geometrie[j][i - 1]) {
          // gauche 左
          voisine[1] = 1; 
        }
        if (id === this.terrain.geometrie[j][i + 1]) {
          // droite 权（右）
          voisine[2] = 1; 
        }
        if (j + 1 < this.terrain.dimension.y) {
          if (id === this.terrain.geometrie[j + 1][i]) {
            //bas 低
            voisine[3] = 1; 
          }
        }
        id = 1 * voisine[0] + 2 * voisine[1] + 4 * voisine[2] + 8 * voisine[3]; 
        this.terrain.apparence.push(id); 
      }
    }
    this.terrain.apparence = utils.morceler(this.terrain.apparence, this.terrain.dimension.x); 
  }
  renduTerrain() {
    for (let j = 0; j < this.terrain.dimension.y; j++) {
      for (let i = 0; i < this.terrain.dimension.x; i++) {
        let id = this.terrain.geometrie[j][i]; 
        if (this.clefs[id].apparence === 'auto') {
          var sourceX = Math.floor(this.terrain.apparence[j][i]) * this.taille; 
          var sourceY = Math.floor(this.terrain.apparence[j][i]) * this.taille; 
          this.ctx.drawImage(this.ressources.feuille.img, sourceX, this.clefs[id].ligne * this.taille, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille); 
        } else if (this.clefs[id].type === 'sprite') {
          if (!this.clefs[id].memoireBoucle) {
            this.clefs[id].frame += this.clefs[id].allure; 
            if (this.clefs[id].frame >= this.clefs[id].sprite.sep) {
              this.clefs[id].frame = 0; 
            }
            this.clefs[id].memoireBoucle = true; 
            // on sait quel id est déjà passé 我们知道id已经发生了什么
            this.nettoyer[id] = true; 
          }
          this.ctx.drawImage(this.clefs[id].sprite.img, Math.floor(this.clefs[id].frame) * this.taille, 0, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille); 
        } else {
          var sourceX = Math.floor(this.clefs[id].apparence % 15) * this.taille; 
          var sourceY = Math.floor(this.clefs[id].apparence / 15) * this.taille; 
          this.ctx.drawImage(this.ressources.feuille.img, sourceX, sourceY, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille); 
        }
      }
    }
    for (var i = 0; i < this.nettoyer.length; i++) {
      if (this.nettoyer[i]) {
        this.clefs[i].memoireBoucle = false; 
      }
    }
  }
  basculer() {
    this.tableau.vel.x *= this.tableau.friction; 
    this.tableau.vel.y *= this.tableau.friction; 
    this.tableau.vel.x += this.force.x; 
    this.tableau.vel.y += this.force.y; 
    this.toile.style.transform = 'perspective(500px) rotateY(' + this.tableau.vel.x * 6 + 'deg) rotateX(' + -this.tableau.vel.y * 6 + 'deg)'; 
  }
  rendu() {
    this.basculer(); 
    this.renduTerrain(); 
    for (var i = this.ennemis.length - 1; i >= 0; i--) {
      this.ennemis[i].rendu(); 
    }
    this.joueur.rendu(); 
  }
  boucle() {
    this.ctx.fillStyle = 'black'; 
    this.ctx.fillRect(0, 0, this.L, this.H); 
    this.rendu(); 
    if (!this.enPause) {
      this.animation = requestAnimationFrame(() => this.boucle()); 
    }
  }
  action(action, pos) {
    if (!this.joueur.mort) {
      switch (action) {
        case 'mort':
          this.joueur.mort = true; 
          this.joueur.apparition = false; 
          break; 
        case 'suivant':
          this.niveauActuel += 1; 
          if (this.niveauActuel < this.niveaux.length) {
            this.chargerTerrain(); 
          } else {
            document.getElementById('shiftBtn').style.visibility = 'hidden'; 
            document.getElementById('shiftBtnBg').style.visibility = 'hidden'; 
            document.getElementById('restartBtn').style.visibility = 'visible'; 
            document.getElementById('recruitBtn').style.visibility = 'visible'; 
            this.toile.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg)'; 
            niveaux = null; 
            this.enPause = true; 
            cancelAnimationFrame(this.animation); 
            this.animation = null; 
            this.ctx.restore(); 
            this.ctx.fillRect(0, 0, this.L, this.H); 
            this.ctx.fillStyle = '#00e435'; 
            this.ctx.textAlign = 'center'; 
            this.ctx.font = '36px Arial'; 
            this.ctx.fillText('(๑•̀ㅂ•́)و✧', this.L / 2, this.H / 2 - 280); 
            this.ctx.fillText('恭喜你通过了所有关卡', this.L / 2, this.H / 2 - 220);  
            this.ctx.fillText('你的分数 : ' + this.score, this.L / 2, this.H / 2 - 160); 
            this.ctx.fillText('✧✧✧创维俱乐部✧✧✧', this.L / 2, this.H / 2 - 40); 
            this.ctx.fillText('✧✧✧期待你的到来✧✧✧', this.L / 2, this.H / 2 + 20); 
            this.ctx.font = '30px Arial'; 
            this.ctx.fillText('华工创维俱乐部', this.L / 2, this.H - 40); 
          }
          break; 
        case 'point':
          this.terrain.geometrie[Math.floor(pos.y / this.taille)][Math.floor(pos.x / this.taille)] = 1; 
          this.score += 1; 
          break; 
        default:
          console.log('aucune action reconnue');   // 没有公认的行动
      }
    }
  }
}


let parametres = {

    feuille:'feuille', 

    taille:40, 

    clefs:[
      {type:'tuile', nom:'herbe', id:1, collision:false, apparence:0}, 
      {type:'tuile', nom:'mur', id:2, collision:true, apparence:'auto', ligne:1}, 
      {type:'tuile', nom:'depart', id:3, collision:false, apparence:2}, 
      {type:'sprite', nom:'arrive', id:4, action:'suivant', collision:false, apparence:'sortie', allure:0.3}, 
      {type:'tuile', nom:'trou', id:5, action:'mort', collision:false, apparence:4}, 
      {type:'tuile', nom:'tuyaux', id:6, collision:true, apparence:'auto', ligne:2}, 
      {type:'sprite', nom:'piece', id:7, collision:false, action:'point', apparence:'piece', ligne:2, allure:0.3}, 
      {type:'tuile', nom:'xAxe', id:8, collision:false, apparence:0}, 
      {type:'tuile', nom:'yAxe', id:9, collision:false, apparence:0}, 
    ],

    packImages: [
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-bille.png', nom:'bille', l:800, h:40, ligne:1, sep:20, allure:0.15},
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-pikkux.png', nom:'pikkux', l:160, h:40, ligne:1, sep:4, allure:0.15},
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-pikkuy.png', nom:'pikkuy', l:160, h:40, ligne:1, sep:4, allure:0.15},
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-feuille.gif', nom:'feuille'},
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-herbe.png', nom:'herbe'},
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-sortie.png', nom:'sortie', l:400, h:40, ligne:1, sep:9},
      {img:'http://image.noelshack.com/fichiers/2017/04/1485167646-piece.png', nom:'piece', l:400, h:40, ligne:1, sep:10},
    ],
}

// 设置地图------------------------------------------------------------------------------------------------
var originMap = [
  map1 = {
    geometrie:[
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,1,1,1,2,2,2,2,1,1,1,2,2,2,2,1,1,1,6], 
      [6,1,1,1,2,2,2,2,1,1,1,2,2,2,2,1,1,1,6], 
      [6,1,1,1,2,2,2,2,1,1,1,2,2,2,2,1,1,1,6], 
      [6,1,1,1,1,1,2,2,1,1,1,2,2,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,1,1,2,1,1,1,6], 
      [6,1,1,1,2,2,2,1,1,7,1,1,2,2,2,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,7,1,1,2,2,2,1,1,1,6], 
      [6,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,6,2,1,1,4,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,6], 
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
    ], 
  }, 
  
  map2 = {
    geometrie:[
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,7,7,7,7,1,1,1,1,1,1,1,7,7,7,7,1,6], 
      [6,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,6], 
      [6,1,7,1,1,1,1,1,1,5,1,1,1,1,1,1,7,1,6], 
      [6,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,1,4,1,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,5,1,1,1,1,1,1,1,1,1,1,1,5,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,1,1,1,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,7,1,2,2,1,1,1,1,1,1,1,2,2,1,7,1,6], 
      [6,1,7,1,2,2,1,1,1,3,1,1,1,2,2,1,7,1,6], 
      [6,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,6], 
      [6,1,7,7,7,7,1,1,1,1,1,1,1,7,7,7,7,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
    ], 
  }, 
  
  map3 = {
    geometrie:[
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,5,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,7,5,6], 
      [6,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,7,5,6], 
      [6,5,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,5,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,7,5,6], 
      [6,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,7,5,6], 
      [6,5,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,5,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,7,5,6], 
      [6,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,7,5,6], 
      [6,5,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,5,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,7,5,6], 
      [6,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,7,5,6], 
      [6,5,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,7,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,7,7,7,7,7,7,5,7,7,7,7,7,7,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,6], 
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
    ], 
  }, 
  
  map4 = {
    geometrie:[
      [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5], 
      [5,1,1,1,5,1,1,1,1,1,1,1,1,1,5,1,1,1,5], 
      [5,1,3,1,5,1,7,7,7,7,7,7,7,1,5,1,4,1,5], 
      [5,1,1,1,5,1,7,7,7,7,7,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,1,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,1,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,5,1,7,7,1,5,1,7,7,1,5,1,7,1,5], 
      [5,1,7,1,1,1,7,7,1,5,1,7,7,1,1,1,7,1,5], 
      [5,1,7,7,7,7,7,7,1,5,1,7,7,7,7,7,7,1,5], 
      [5,1,7,7,7,7,7,7,1,5,1,7,7,7,7,7,7,1,5], 
      [5,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,5], 
      [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
    ]
  }, 
  
  map5 = {
    geometrie:[
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,3,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,1,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,1,1,4,1,1,5,1,5,1,5,1,5,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,5,1,5,1,5,1,1,1,1,1,1,6], 
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
    ]
  }, 
  
  map6 = {
    geometrie:[
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,1,1,1,1,1,1,7,1,1,1,1,1,1,7,7,7,4,6], 
      [6,5,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,7,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,7,1,1,1,1,5,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,6,1,1,1,8,2,9,1,1,1,1,6], 
      [6,1,1,1,1,1,5,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,6,1,1,1,1,8,2,9,1,1,1,6], 
      [6,7,1,1,1,1,5,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,5,1,7,1,1,1,6,1,1,1,1,1,8,2,9,1,1,6], 
      [6,7,1,1,1,1,5,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,6,1,1,1,1,1,1,8,2,9,1,6], 
      [6,1,1,1,1,1,5,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,6,1,1,1,1,1,1,1,8,2,9,6], 
      [6,7,1,1,1,1,5,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,7,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,1,1,1,1,1,1,1,5,5,1,7,7,1,7,7,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,7,7,1,5,5,1,7,7,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,7,7,1,7,7,1,5,5,1,3,6], 
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
    ]
  }, 
  
  map7 = {
    geometrie:[
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], 
      [6,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,7,7,4,7,7,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,1,1,6], 
      [6,2,2,2,2,2,2,2,2,2,1,1,8,1,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,2,2,2,2,2,2,2,2,1,1,8,1,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,2,2,2,2,2,2,2,1,1,8,1,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,2,2,2,2,2,2,1,1,8,1,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,2,2,2,2,2,1,1,8,1,2,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,2,2,2,2,1,1,8,1,2,2,2,2,2,2,2,2,2,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
      [6,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6], 
      [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
      [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
    ]
  }, 
  
  map8 = {
    geometrie:[
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], 
      [2,1,1,9,1,1,1,1,9,1,9,1,1,1,1,9,1,1,2], 
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,5,1,1,1,9,1,1,1,5,1,1,1,1,2], 
      [2,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,2], 
      [2,1,1,1,1,1,1,5,1,1,1,5,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,8,1,1,1,2,1,1,1,8,1,1,1,1,2], 
      [2,1,1,1,1,2,9,1,1,4,1,1,9,2,1,1,1,1,2], 
      [2,1,1,1,1,2,9,1,1,4,1,1,9,2,1,1,1,1,2], 
      [2,1,1,1,1,8,1,1,1,2,1,1,1,8,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,5,1,1,1,5,1,1,1,1,1,1,2], 
      [2,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,2], 
      [2,1,1,1,1,5,1,1,1,9,1,1,1,5,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,9,1,1,1,1,9,1,9,1,1,1,1,9,1,1,2], 
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ]
  }, 
  
  // 福利
  mapCadeau = {
    geometrie:[
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,7,7,7,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,7,7,7,7,7,7,7,1,1,1,1,1,2], 
      [2,1,1,1,1,7,7,7,7,7,7,7,7,7,1,1,1,1,2], 
      [2,1,1,1,7,7,7,7,7,7,7,7,7,7,7,1,1,1,2], 
      [2,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,2], 
      [2,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,2], 
      [2,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,2], 
      [2,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,2], 
      [2,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,2], 
      [2,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,2], 
      [2,1,1,1,7,7,7,7,7,7,7,7,7,7,7,1,1,1,2], 
      [2,1,1,1,1,7,7,7,7,7,7,7,7,7,1,1,1,1,2], 
      [2,1,1,1,1,1,7,7,7,7,7,7,7,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,7,7,7,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ]
  }, 
  
  // 华工创维
  mapHuaGongChuangWei = {
    geometrie:[
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,3,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,2,1,1,2,1,1,2,7,1,1,2,2,2,2,2,1,1], 
      [1,1,2,1,1,2,1,2,2,7,1,1,1,1,2,1,1,1,1], 
      [1,2,2,1,1,2,2,2,1,7,1,1,1,1,2,1,1,1,1], 
      [1,1,2,1,2,2,1,1,2,7,1,1,1,1,2,1,1,1,1], 
      [1,1,2,1,1,2,2,2,2,7,1,1,1,1,2,1,1,1,1], 
      [1,1,1,1,2,1,1,1,1,7,1,1,1,1,2,1,1,1,1], 
      [1,2,2,2,2,2,2,2,2,7,1,1,1,1,2,1,1,1,1], 
      [1,1,1,1,2,1,1,1,1,7,1,1,1,1,2,1,1,1,1], 
      [1,1,1,1,2,1,1,1,1,7,1,1,1,1,2,1,1,1,1], 
      [1,1,1,1,2,1,1,1,1,7,1,2,2,2,2,2,2,2,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [7,7,7,7,7,7,7,7,7,5,7,7,7,7,7,7,7,7,7], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,2,1,1,1,1,1,2,7,1,1,2,1,2,1,2,1,1], 
      [1,2,2,2,1,1,1,1,2,7,1,2,2,1,2,1,2,1,1], 
      [2,2,1,2,2,1,1,1,2,7,2,2,1,2,2,1,1,1,1], 
      [2,1,1,1,2,1,2,1,2,7,2,2,2,1,2,2,2,2,2], 
      [1,2,2,2,1,1,2,1,2,7,1,2,2,1,2,1,2,1,1], 
      [1,2,1,2,1,1,2,1,2,7,2,2,1,1,2,2,2,2,1], 
      [1,2,1,2,1,1,2,1,2,7,2,2,2,1,2,1,2,1,1], 
      [1,2,1,1,1,1,1,1,2,7,1,1,1,1,2,2,2,2,1], 
      [1,2,1,1,1,2,1,1,2,7,1,1,1,1,2,1,2,1,1], 
      [1,2,2,2,2,2,1,2,2,7,2,2,2,1,2,2,2,2,2], 
      [1,1,1,1,1,1,1,1,2,7,1,1,1,1,2,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,4,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1]
    ], 
  }, 
  
  // 加入我们
  mapJiaRuWoMen = {
    geometrie:[
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,3,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,2,1,1,1,1,1,1,7,1,2,2,2,1,1,1,1,1], 
      [1,1,2,1,1,1,1,1,1,7,1,1,1,2,2,1,1,1,1], 
      [2,2,2,2,2,1,2,2,2,2,1,1,2,2,2,1,1,1,1], 
      [1,1,2,1,2,1,2,1,1,2,1,1,2,1,2,2,1,1,1], 
      [1,1,2,1,2,1,2,1,1,2,1,1,2,1,2,2,1,1,1], 
      [1,1,2,1,2,1,2,2,2,2,1,1,2,1,1,2,1,1,1], 
      [1,2,2,1,2,1,1,1,1,7,1,2,2,1,1,2,2,1,1], 
      [2,2,1,2,2,1,1,1,1,7,2,2,1,1,1,1,2,2,1], 
      [2,1,1,1,2,1,1,1,1,2,2,1,1,1,1,1,1,2,2], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [7,7,7,7,7,7,7,7,7,5,7,7,7,7,7,7,7,7,7], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,2,1,2,1,1,1,7,2,1,2,1,2,2,2,2,1], 
      [1,2,2,2,1,2,1,2,1,7,2,1,2,1,1,1,1,2,1], 
      [2,2,2,1,1,2,1,2,1,2,2,1,1,1,1,1,1,2,1], 
      [1,1,2,1,1,2,1,1,1,7,2,1,2,1,1,1,1,2,1], 
      [2,2,2,2,2,2,2,2,2,7,2,1,2,1,1,1,1,2,1], 
      [1,1,2,1,1,2,1,1,1,7,2,1,2,1,4,1,1,2,1], 
      [1,1,2,2,1,2,1,2,2,7,2,1,2,1,1,1,1,2,1], 
      [2,2,2,1,1,2,2,2,1,7,2,1,2,1,1,1,1,2,1], 
      [1,1,2,1,2,2,2,1,1,7,2,1,2,1,1,1,1,2,1], 
      [1,2,2,1,1,1,2,2,1,7,2,1,2,1,1,1,2,2,1], 
      [1,1,2,1,1,1,1,2,2,7,2,1,2,1,1,1,1,2,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1]
    ], 
  }, 
  
  // 宣讲会时间
  mapTime = {
    geometrie:[
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,3,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,2,2,2,2,1,1,1,1,7,1,2,1,1,2,2,2,2,1], 
      [1,2,1,1,2,1,1,1,1,7,2,2,1,1,2,1,1,2,1], 
      [1,2,1,1,2,1,1,1,1,2,2,2,1,1,2,1,1,2,1], 
      [1,2,2,2,2,1,1,1,1,7,1,2,1,1,2,2,2,2,1], 
      [1,1,1,1,2,1,1,1,1,7,1,2,1,1,1,1,1,2,1], 
      [1,1,1,1,2,1,2,2,1,7,1,2,1,1,1,1,1,2,1], 
      [1,2,2,2,2,1,2,2,1,2,2,2,2,1,2,2,2,2,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [7,7,7,7,7,7,7,7,5,7,5,7,7,7,7,7,7,7,7], 
      [7,7,7,7,7,7,7,7,7,5,7,7,7,7,7,7,7,7,7], 
      [7,7,7,7,7,7,7,7,5,7,5,7,7,7,7,7,7,7,7], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,2,1,1,2,2,2,1,7,1,2,2,2,1,2,2,2,1], 
      [1,2,2,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1], 
      [1,1,2,1,1,2,2,2,1,7,1,2,1,2,1,2,1,2,1], 
      [1,1,2,1,1,1,1,2,1,7,1,2,1,2,1,2,1,2,1], 
      [1,1,2,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1], 
      [1,2,2,2,1,2,2,2,1,7,1,2,2,2,1,2,2,2,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,4,1], 
      [1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1]
    ], 
  }, 
  
  // 宣讲会地点
  mapPlace = {
    geometrie:[
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
      [1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
      [1,2,1,1,1,1,2,1,2,1,1,2,2,1,2,2,1,2,2], 
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,2,1], 
      [1,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2], 
      [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2], 
      [2,2,2,1,2,2,2,2,2,1,1,2,1,2,2,2,2,2,2], 
      [1,2,1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,2,1], 
      [1,2,1,1,2,2,2,2,2,1,1,1,1,1,1,2,2,1,1], 
      [1,2,1,1,2,1,2,1,2,1,1,1,1,1,1,2,2,1,1], 
      [1,2,1,1,2,2,2,2,2,1,1,1,1,1,2,2,1,1,1], 
      [1,2,1,1,2,1,2,1,2,1,1,1,2,2,2,2,2,2,2], 
      [1,2,1,2,2,2,2,2,2,2,2,1,1,1,1,2,2,1,1], 
      [1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,2,1], 
      [1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,2,2,1], 
      [1,2,1,1,1,2,1,1,2,1,1,1,1,2,2,2,2,2,1], 
      [1,2,1,1,1,1,1,2,2,1,1,1,1,1,2,2,2,1,1], 
      [1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1], 
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
      [1,1,1,2,1,1,1,2,2,2,2,2,1,2,2,2,2,2,1], 
      [1,1,2,2,1,1,1,2,1,1,1,2,1,1,1,1,1,2,1], 
      [1,2,2,2,1,1,1,2,1,1,1,2,1,1,1,1,1,2,1], 
      [1,1,1,2,1,1,1,2,1,1,1,2,1,2,2,2,2,2,1], 
      [1,1,1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,1,1], 
      [1,1,1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,1,1], 
      [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1], 
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1], 
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ], 
  }
]; 

// 使用 JSON 序列化（stringify）和反序列化（parse）进行地图对象的复制，保护原地图对象参数不被修改
// 这个方法使用较为简单，可以满足基本的深复制需求，而且能够处理JSON格式能表示的所有数据类型，但是对于正则表达式类型、函数类型等无法进行深复制(而且会直接丢失相应的值)，同时如果对象中存在循环引用的情况也无法正确处理
let niveaux = JSON.parse(JSON.stringify(originMap)); 
// ------------------------------------------------------------------------------------------------设置地图


// 游戏
let jeu = new Labirynthe(parametres, niveaux); 