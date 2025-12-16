📄 GDD : Framework de Design des Items (Jokers & Scripts)
Ce document définit la structure standard pour la création de contenu dans Binary Hustle. Chaque item doit respecter ces règles pour garantir l'équilibre, la lisibilité et la faisabilité technique.
1. Structure Atomique (Les 5 Piliers)
Chaque item est un objet défini par 5 attributs clés.
🆔 1. L'Identité (Flavor & Meta)
• Nom (Code Name) : Thématique Hacking/Dev (ex: Kernel Panic, Blue Screen, Spaghetti Code).
• Type :
    ◦ 🃏 Joker (Passif) : Effet permanent tant qu'il est équipé dans un slot.
    ◦ 📜 Script (Consommable) : Usage unique, détruit après activation.
• Rareté : Définit le prix et le taux d'apparition.
    ◦ ⚪ Common (Gris) : Simple, stats pures.
    ◦ 🟢 Uncommon (Vert) : Conditionnel ou économique.
    ◦ 🔵 Rare (Bleu) : Changement de règles (Rule-bending).
    ◦ 🟡 Legendary (Or) : "Game Breaker" / Synergie massive.
• Prix : Coût de base au Shop.
🔫 2. Le Trigger (Le Déclencheur)
Quand le code s'exécute-t-il ? Point critique pour l'implémentation.
• OnBuy : À l'achat (effet immédiat one-shot).
• OnRoundStart : À la génération du nombre mystère (avant le 1er essai).
• OnGuess : À chaque fois que le joueur valide une proposition.
• OnHint : Quand le système donne un indice (+ / - / Brûlant).
• OnWin : Au moment de la victoire du round.
• OnLoss : Défaite potentielle (avant le Game Over).
• OnSell : À la revente au shop.
❓ 3. La Condition (Le "Si")
• Always : Toujours actif (Inconditionnel).
• Math : Si Pair / Impair / Premier / Multiple de X.
• Context : Si Dernier Essai / Si Cash < 0 / Si Full HP.
• RNG : X% de chance de s'activer.
📦 4. Le Payload (L'Effet)
Quelle variable du jeu est modifiée ?
• 💰 Economy ($) : Cash (+/-), Intérêts, Prix du Shop.
• ❤️ Lives (Attempts) : Essais (+/-), Récupération d'essai.
• 🎯 Range ([ ]) : Min/Max, Rétrécissement, Bornage.
• 👁️ Intel (Data) : Révélation d'infos (Parité, Dernier chiffre).
• ✖️ Score (Mult) : Multiplicateur de gains finaux.
• 🎒 Inventory : Spawn/Destroy/Transform items.
🔗 5. La Synergie (Le "Hook")
Comment cet item interagit-il avec les autres ? C'est ce qui crée la profondeur du gameplay.
2. La Matrice des 6 Archétypes
Pour générer 100+ items sans être répétitif, assurez-vous de couvrir ces catégories.ArchétypeObjectif JoueurDesign PatternExemple Typique🌾 FARMERSGénérer du CashRisque vs Richesse
Se mettre en danger ou jouer lentement pour gagner plus.The Miner : +1$ par seconde passée à réfléchir.🔍 SOLVERSTrouver le nombreInfo Partielle
Ne jamais donner la réponse brute, réduire le champ des possibles.Checksum : Révèle la somme des chiffres (ex: 42 -> 6).🛡️ TANKERSNe pas mourirFilet de Sécurité
Coûteux, mais empêche le Game Over.Backup Save : Consommé pour annuler une défaite.🎲 GAMBLERSManipuler la ChanceContrainte RNG
Forcer le jeu à être prévisible.Legacy Code : Le nombre est toujours < 50.📈 SCALERSDevenir fort (Late Game)Snowball (Boule de neige)
Faible au début, monstrueux à la fin.Machine Learning : Gain x0.1 Mult permanent par victoire parfaite.🔥 CHAOSFun / WtfRègles Absurdes
Change l'UI ou les contrôles pour un gros gain.Dark Mode : Cache l'historique des essais. Gain x5.
3. Fiches Modèles (Templates)
Exemple 1 : Consommable "Risqué"ChampValeurNomZIP BOMBType📜 ScriptRareté🔵 RareTriggerOnUse (Immédiat)Description"Compresse l'intervalle actuel de 80% mais consomme 3 essais instantanément."ConditionAttempts > 3 (Le joueur doit avoir la vie pour payer).PayloadRange = Range * 0.2 ; Attempts = Attempts - 3.SynergieTrès fort avec des Jokers qui s'activent en "Low Health" (Dernier essai).
Exemple 2 : Joker Économique "Troll"ChampValeurNom404 NOT FOUNDType🃏 JokerRareté🟢 UncommonTriggerOnGuess (Sur erreur)Description"Si vous proposez un nombre hors-limites (déjà éliminé), gagnez 2$."ConditionGuess < Min OR Guess > MaxPayloadCash += 2 (Max 5 fois par round).SynergiePermet de "farmer" de l'argent sur les rounds faciles en faisant exprès de se tromper.
4. Stratégie de Production de Masse
Pour coder rapidement beaucoup d'items, créez des Familles Paramétriques.
Famille A : "BOUNTY" (Primes)
Logique : IF [Condition] THEN [Gain Cash]
• Var 1 : Si Pair
• Var 2 : Si Impair
• Var 3 : Si contient un "7"
• Var 4 : Si < 10
• Var 5 : Si Palindrome (ex: 33, 44, 88)
Famille B : "DISCOUNT" (Soldes)
Logique : ShopPrice_[Category] *= [Multiplier]
• Var 1 : Prix des Scripts -50%
• Var 2 : Prix du Reroll fixe à 1$
• Var 3 : Prix des items Rares -30%
Famille C : "MUTATOR" (Règles)
Logique : GameConfig_[Param] += [Value]
• Var 1 : Max Attempts +1
• Var 2 : Max Attempts -2 (mais Gain x3)
• Var 3 : Max Number = 150


npx vitest -- --reporter=verbose --run