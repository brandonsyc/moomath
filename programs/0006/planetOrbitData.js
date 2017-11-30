// Note that all angles are in degrees.

// Data for planets as Float32Array's, one for each of Mercury, Venus, ..., Saturn.

// Format: [semi-major axis, orbital eccentricity, inclination, longitude of the ascending node, mean anomaly, mean motion, argument of perihelion, semi-major axis, ...]
var planetOrbitData = {};

var moonNames = [];

// Data for more minor objects (and Uranus and Neptune) as Float32Array's

// Format: semi-major axis, orbital eccentricity, inclination, longitude of the ascending node, mean anomaly, mean motion, argument of perihelion]
var minorOrbitData = {
  'Saturn': new Float32Array([9.58192920299, 0.0556383427635, 0.0433583847532, 1.98443342811, 5.59248098416, 0.000580048168704, 5.86196044989]),
  'Uranus': new Float32Array([19.2294159294, .0444055667, .0134837914, 1.2913577306, 2.49504943941, 2.040055e-4, 1.68497029757]),
  'Neptune': new Float32Array([30.1036348652, .0112152295, .0308571501, 2.30023750462, 4.67338138035, 1.041512e-4, 4.63646042335]),
  '1 Ceres': new Float32Array([2.76649601664, 0.0783756291076, 0.184714489335, 1.40489157056, 0.107802909408, 0.00373840516161, 1.2901973684]),
  '2 Pallas': new Float32Array([2.7723224774, 0.22964356726, 0.608179877273, 3.02287170389, 6.16031900868, 0.00372662610842, 5.41515718837]),
  '3 Juno': new Float32Array([2.66803490264, 0.258443457289, 0.226324149941, 2.97007294298, 4.19347856891, 0.00394724589311, 4.32896964323]),
  '4 Vesta': new Float32Array([2.36153493655, 0.0900224466622, 0.124510662631, 1.81429485315, 5.95198876037, 0.00474012592426, 2.61077986991])
};

var moonOrbitData = {
  'Moon': {
    orbit: new Float32Array([0.0025526735307, 0.063147216946, 0.0914600198451, 2.16347621838, 2.55993156586, 0.229964582, 5.39171775629, -0.00287046, 0.00092549]),
    parent: 'Earth'
  },
  'Phobos': {
    orbit: new Float32Array([6.26921417267e-05, 0.0146885414789, 0.454751955457, 1.4803081809, 3.31422552167, 19.6866472355, 5.98149125579]),
    parent: 'Mars'
  },
  'Deimos': {
    orbit: new Float32Array([0.000156808266465, 0.000334729231371, 0.481193629379, 1.46019101016, 0.0938536218483, 4.97666016617, 3.69332596832]),
    parent: 'Mars'
  },
  'Io': {
    orbit: new Float32Array([0.00282113869684, 0.00471549653947, 0.0386163577555, 5.87914928621, 5.84950850282, 3.54702632329, 1.15484865668]),
    parent: 'Jupiter'
  },
  'Europa': {
    orbit: new Float32Array([0.00448701901535, 0.00981281044519, 0.0312569214186, 5.80545519117, 6.02856346685, 1.76831437657, 4.4444389797]),
    parent: 'Jupiter'
  },
  'Ganymede': {
    orbit: new Float32Array([0.00715583382304, 0.00145721211534, 0.0386441805325, 5.98946304114, 4.83541337693, 0.878046327863, 5.58173219515]),
    parent: 'Jupiter'
  },
  'Callisto': {
    orbit: new Float32Array([0.0125855599821, 0.00743940450712, 0.0352016545539, 5.8981924545, 1.48560521685, 0.376438767526, 0.281485928929]),
    parent: 'Jupiter'
  },
  'Amalthea': {
    orbit: new Float32Array([0.00121657291749, 0.00620148290261, 0.0427625836803, 5.76929078447, 5.85055692157, 12.5251702298, 1.85066882383]),
    parent: 'Jupiter'
  },
  'Himalia': {
    orbit: new Float32Array([0.0760178767018, 0.166203446636, 0.527913260367, 1.12036726706, 1.36556334121, 0.0253581315849, 5.60495969874]),
    parent: 'Jupiter'
  },
  'Elara': {
    orbit: new Float32Array([0.0784848524393, 0.22186887809, 0.504616757552, 1.96867140082, 6.05464583041, 0.024171972089, 2.26744542349]),
    parent: 'Jupiter'
  },
  'Pasiphae': {
    orbit: new Float32Array([0.156587810115, 0.379546431232, 2.44498601116, 5.51087099068, 4.87337287993, 0.00857736571212, 3.01645177938]),
    parent: 'Jupiter'
  },
  'Sinope': {
    orbit: new Float32Array([0.153536831091, 0.316411070924, 2.65530571333, 5.37598010431, 2.74803575263, 0.00883429696657, 6.1833144722]),
    parent: 'Jupiter'
  },
  'Lysithea': {
    orbit: new Float32Array([0.078476501935, 0.136784992612, 0.486262851577, 0.161263295945, 5.73285263747, 0.0241758303177, 0.842065325182]),
    parent: 'Jupiter'
  },
  'Carme': {
    orbit: new Float32Array([0.161786309894, 0.242483098434, 2.87496048707, 2.01582827582, 4.52872664526, 0.00816729418244, 0.113124738375]),
    parent: 'Jupiter'
  },
  'Ananke': {
    orbit: new Float32Array([0.144947401947, 0.380349314458, 2.64688110714, 0.239004251358, 4.74413712136, 0.00963108465231, 1.3739390393]),
    parent: 'Jupiter'
  },
  'Leda': {
    orbit: new Float32Array([0.0744683007487, 0.172567458235, 0.481340700607, 3.78518735533, 4.05981097208, 0.0261537330855, 4.73469408877]),
    parent: 'Jupiter'
  },
  'Thebe': {
    orbit: new Float32Array([0.00148654427167, 0.0151734015388, 0.0574098187725, 5.89966783244, 3.18832267837, 9.27308160441, 0.464401095375]),
    parent: 'Jupiter'
  },
  'Adrastea': {
    orbit: new Float32Array([0.000868147945465, 0.00670983242199, 0.0384625000794, 5.89798952835, 6.27641038445, 20.7778324832, 4.10433439489]),
    parent: 'Jupiter'
  },
  'Metis': {
    orbit: new Float32Array([0.000861502130199, 0.00668648148465, 0.0388589082611, 5.89318224743, 0.0572137590709, 21.0187226605, 3.19837275642]),
    parent: 'Jupiter'
  },
  'Callirrhoe': {
    orbit: new Float32Array([0.153963294873, 0.197665063633, 2.4288629989, 4.85526667735, 2.05782727429, 0.00879761714375, 0.235828302107]),
    parent: 'Jupiter'
  },
  'Themisto': {
    orbit: new Float32Array([0.0494443690127, 0.196759695583, 0.802525300106, 3.53721450984, 5.046698642, 0.0483409960605, 4.12398040463]),
    parent: 'Jupiter'
  },
  'Megaclite': {
    orbit: new Float32Array([0.164497703021, 0.446534966304, 2.65223786993, 5.09919139834, 2.02605492388, 0.00796619799272, 5.40962140116]),
    parent: 'Jupiter'
  },
  'Taygete': {
    orbit: new Float32Array([0.148511228987, 0.292166519221, 2.82804119962, 5.24960850053, 2.03245921558, 0.00928649683704, 3.62552716848]),
    parent: 'Jupiter'
  },
  'Chaldene': {
    orbit: new Float32Array([0.15659853944, 0.202405601053, 2.89241803979, 2.34663220528, 4.80858709141, 0.00857648421188, 4.03983755174]),
    parent: 'Jupiter'
  },
  'Harpalyke': {
    orbit: new Float32Array([0.144198771974, 0.254481058526, 2.61735900664, 0.620582562927, 4.45895148364, 0.00970618378709, 1.81981823085]),
    parent: 'Jupiter'
  },
  'Kalyke': {
    orbit: new Float32Array([0.148736589385, 0.303875755407, 2.90496730353, 0.658137942618, 3.9267052685, 0.00926539897845, 4.19665450428]),
    parent: 'Jupiter'
  },
  'Iocaste': {
    orbit: new Float32Array([0.141165397003, 0.242370662493, 2.6002931405, 4.69313978829, 3.17687222917, 0.0100207095074, 1.59507420854]),
    parent: 'Jupiter'
  },
  'Erinome': {
    orbit: new Float32Array([0.157146400212, 0.323670333196, 2.81398198802, 5.43097932389, 4.76820763375, 0.00853167292523, 6.2801065346]),
    parent: 'Jupiter'
  },
  'Isonoe': {
    orbit: new Float32Array([0.159578411128, 0.151933134606, 2.89793541739, 2.33989336972, 2.03054705712, 0.00833738100075, 2.28667980594]),
    parent: 'Jupiter'
  },
  'Praxidike': {
    orbit: new Float32Array([0.136692921825, 0.181440390757, 2.49827002351, 4.90972397548, 2.23291625383, 0.0105165142148, 3.18617213781]),
    parent: 'Jupiter'
  },
  'Autonoe': {
    orbit: new Float32Array([0.166210513823, 0.21549867996, 2.6226800132, 4.62119982898, 2.33945925377, 0.00784337744778, 1.06866430104]),
    parent: 'Jupiter'
  },
  'Thyone': {
    orbit: new Float32Array([0.137714970156, 0.430216102558, 2.61625391145, 4.20222037583, 4.23399969106, 0.010399659611, 1.83368712094]),
    parent: 'Jupiter'
  },
  'Hermippe': {
    orbit: new Float32Array([0.142359407642, 0.183100764464, 2.61655291602, 5.76537574968, 2.76580524336, 0.00989490422387, 4.83929515534]),
    parent: 'Jupiter'
  },
  'Aitne': {
    orbit: new Float32Array([0.148383917404, 0.377837745967, 2.8938776274, 6.25541411213, 2.10408676291, 0.00929845095102, 1.25977813248]),
    parent: 'Jupiter'
  },
  'Eurydome': {
    orbit: new Float32Array([0.152925405378, 0.220485452502, 2.54950039273, 5.19571445477, 4.91850265914, 0.00888733176273, 3.89865791568]),
    parent: 'Jupiter'
  },
  'Euanthe': {
    orbit: new Float32Array([0.13726861797, 0.2339617076, 2.5477130555, 4.62807558503, 6.17127886723, 0.0104504252082, 5.45163028063]),
    parent: 'Jupiter'
  },
  'Euporie': {
    orbit: new Float32Array([0.130652407988, 0.120871288024, 2.56709232475, 1.10645075265, 0.981989224716, 0.0112542025095, 1.91316393756]),
    parent: 'Jupiter'
  },
  'Orthosie': {
    orbit: new Float32Array([0.138298528728, 0.300524050734, 2.51840355045, 3.70624383845, 2.81246471372, 0.0103339061558, 4.2713462494]),
    parent: 'Jupiter'
  },
  'Sponde': {
    orbit: new Float32Array([0.16396622805, 0.248580160801, 2.65254186167, 1.90727086974, 3.09658956434, 0.00800496143717, 0.988181203788]),
    parent: 'Jupiter'
  },
  'Kale': {
    orbit: new Float32Array([0.154157002417, 0.231194474257, 2.90978830192, 0.989148035055, 3.07087405068, 0.00878104025144, 1.20722181924]),
    parent: 'Jupiter'
  },
  'Pasithee': {
    orbit: new Float32Array([0.155330435067, 0.318255761108, 2.84781524247, 5.55017961786, 4.148049004, 0.00868172480219, 3.62973028089]),
    parent: 'Jupiter'
  },
  'Hegemone': {
    orbit: new Float32Array([0.155386962627, 0.378167493471, 2.55552430778, 5.43607504755, 4.20877957621, 0.00867698780164, 3.35433810876]),
    parent: 'Jupiter'
  },
  'Mneme': {
    orbit: new Float32Array([0.136872930949, 0.309044830001, 2.58165605931, 0.0163898510033, 4.1198313588, 0.0104957747675, 0.874951570095]),
    parent: 'Jupiter'
  },
  'Aoede': {
    orbit: new Float32Array([0.153694665135, 0.597402906373, 2.73096883134, 2.73102387842, 3.62413313222, 0.0088206921211, 0.75147965959]),
    parent: 'Jupiter'
  },
  'Thelxinoe': {
    orbit: new Float32Array([0.138203698702, 0.170492524429, 2.63528311377, 3.05281890685, 4.80193537171, 0.0103445440694, 5.35719457164]),
    parent: 'Jupiter'
  },
  'Arche': {
    orbit: new Float32Array([0.150188259955, 0.205658063272, 2.83887938367, 5.81792664166, 0.591752525453, 0.00913138964007, 3.01220639436]),
    parent: 'Jupiter'
  },
  'Kallichore': {
    orbit: new Float32Array([0.147960245251, 0.162159385034, 2.89260107189, 0.416873197123, 1.16459104446, 0.00933841756654, 6.15530723881]),
    parent: 'Jupiter'
  },
  'Helike': {
    orbit: new Float32Array([0.139180032538, 0.152771901498, 2.70995718641, 1.65065298008, 0.797495505701, 0.0102358862903, 5.32727565079]),
    parent: 'Jupiter'
  },
  'Carpo': {
    orbit: new Float32Array([0.113139562825, 0.203187265895, 1.02459812783, 0.909531348542, 5.87542033858, 0.0139659058133, 1.5792001023]),
    parent: 'Jupiter'
  },
  'Eukelade': {
    orbit: new Float32Array([0.161945593872, 0.221543322294, 2.89348039098, 3.49811659277, 4.08827026156, 0.00815524755179, 5.06175089765]),
    parent: 'Jupiter'
  },
  'Cyllene': {
    orbit: new Float32Array([0.156076670271, 0.28031273865, 2.46836635071, 4.42718139195, 2.67486368183, 0.00861953557248, 3.04705495611]),
    parent: 'Jupiter'
  },
  'Kore': {
    orbit: new Float32Array([0.158148866907, 0.247807932382, 2.39587872863, 5.65780893446, 0.708692931091, 0.00845068135339, 2.36189990286]),
    parent: 'Jupiter'
  },
  '2003J17': {
    orbit: new Float32Array([0.155377388736, 0.31483080784, 2.82006305707, 5.22664648591, 2.14884890588, 0.00867778978911, 6.00534608284]),
    parent: 'Jupiter'
  },
  'Mimas': {
    orbit: new Float32Array([0.00124357903109, 0.0217565031591, 0.471310773756, 3.00304463163, 0.652389421243, 6.63153224448, 1.89788376447]),
    parent: 'Saturn'
  },
  'Enceladus': {
    orbit: new Float32Array([0.00159373831144, 0.00635144054281, 0.489597405751, 2.95844650307, 0.121360089572, 4.57086589118, 2.36462147319]),
    parent: 'Saturn'
  },
  'Tethys': {
    orbit: new Float32Array([0.00197182083258, 0.000967521108736, 0.475078948738, 2.9321164825, 6.11493629659, 3.321414038, 2.75901348763]),
    parent: 'Saturn'
  },
  'Dione': {
    orbit: new Float32Array([0.00252444884959, 0.00292841264362, 0.489421391059, 2.95780911682, 5.79554714642, 2.29284402698, 2.8785992324]),
    parent: 'Saturn'
  },
  'Rhea': {
    orbit: new Float32Array([0.00352428307098, 0.000800251677884, 0.49290521639, 2.94932910274, 3.61114197355, 1.39001236209, 2.89342512034]),
    parent: 'Saturn'
  },
  'Titan': {
    orbit: new Float32Array([0.00816812949542, 0.0286006527251, 0.483776402991, 2.95378041344, 2.85250117706, 0.393995650214, 2.86947923306]),
    parent: 'Saturn'
  },
  'Hyperion': {
    orbit: new Float32Array([0.00992701674072, 0.126730110739, 0.474888513761, 2.93747355308, 1.2322596657, 0.294032832581, 3.29333207646]),
    parent: 'Saturn'
  },
  'Iapetus': {
    orbit: new Float32Array([0.0238142858078, 0.0278624348122, 0.300863447443, 2.43807792464, 3.63057807692, 0.0791349449566, 4.00830888491]),
    parent: 'Saturn'
  },
  'Phoebe': {
    orbit: new Float32Array([0.0865238505962, 0.16540515705, 3.02393496149, 4.59369208897, 1.02361713111, 0.011426683599, 6.17375617538]),
    parent: 'Saturn'
  },
  'Janus': {
    orbit: new Float32Array([0.00101628505572, 0.00619064427322, 0.488437728227, 2.9644351608, 1.38674135608, 8.97636799539, 2.86572140966]),
    parent: 'Saturn'
  },
  'Epimetheus': {
    orbit: new Float32Array([0.00101654413316, 0.00602499838729, 0.484147372166, 2.96495696481, 3.44240148959, 8.9729366142, 4.04062176792]),
    parent: 'Saturn'
  },
  'Helene': {
    orbit: new Float32Array([0.0025258086345, 0.00803726973965, 0.487549936807, 2.96544751292, 0.345485953947, 2.29099051775, 2.95647099743]),
    parent: 'Saturn'
  },
  'Telesto': {
    orbit: new Float32Array([0.00197183428005, 0.00108014044647, 0.469226361828, 2.9514781073, 6.11682699139, 3.32137825694, 3.77070058673]),
    parent: 'Saturn'
  },
  'Calypso': {
    orbit: new Float32Array([0.00197155702223, 0.000604526510961, 0.492133264804, 2.90349346269, 0.290599303691, 3.32207890403, 1.29957787291]),
    parent: 'Saturn'
  },
  'Atlas': {
    orbit: new Float32Array([0.000924641166002, 0.005157520671, 0.489533955204, 2.95877423006, 6.06387233518, 10.3434190483, 6.03144945932]),
    parent: 'Saturn'
  },
  'Prometheus': {
    orbit: new Float32Array([0.000936021921072, 0.00484733720379, 0.489584438048, 2.95850990699, 0.46224336939, 10.1553507396, 0.510249312494]),
    parent: 'Saturn'
  },
  'Pandora': {
    orbit: new Float32Array([0.000951539902974, 0.0041145929552, 0.489338260166, 2.96060296379, 1.01399799548, 9.90794185357, 4.17567015635]),
    parent: 'Saturn'
  },
  'Pan': {
    orbit: new Float32Array([0.000897505938492, 0.00506877190447, 0.489595554651, 2.95880846322, 6.28251085622, 10.8160319317, 1.86153273516]),
    parent: 'Saturn'
  },
  'Ymir': {
    orbit: new Float32Array([0.14972393861, 0.394436017282, 3.01857050903, 3.5729307691, 3.78057727524, 0.00501980783882, 0.792249100636]),
    parent: 'Saturn'
  },
  'Paaliaq': {
    orbit: new Float32Array([0.0997327951411, 0.46492739594, 0.825792198261, 6.16434972291, 5.3171198178, 0.00923351312154, 4.14388028796]),
    parent: 'Saturn'
  },
  'Tarvos': {
    orbit: new Float32Array([0.124164115467, 0.645013259562, 0.591663399054, 1.66994731235, 4.46358917297, 0.00664706320685, 4.93872101335]),
    parent: 'Saturn'
  },
  'Ijiraq': {
    orbit: new Float32Array([0.0757163883175, 0.368150488948, 0.865935807313, 2.66174762379, 0.495651458682, 0.0139585119336, 1.19615498727]),
    parent: 'Saturn'
  },
  'Suttungr': {
    orbit: new Float32Array([0.130993296224, 0.120631176499, 3.04881710375, 4.41853084937, 5.54583599643, 0.0061340929302, 1.12517768832]),
    parent: 'Saturn'
  },
  'Kiviuq': {
    orbit: new Float32Array([0.0755616011646, 0.158043702128, 0.851226059202, 6.15461303662, 2.94142781026, 0.0140014246908, 1.60240150085]),
    parent: 'Saturn'
  },
  'Mundilfari': {
    orbit: new Float32Array([0.125161075602, 0.246998511254, 2.95816046065, 1.37930158476, 1.69721801398, 0.00656780162723, 5.33116270375]),
    parent: 'Saturn'
  },
  'Albiorix': {
    orbit: new Float32Array([0.109617219037, 0.491709743245, 0.647318642905, 1.939287456, 0.300416392327, 0.0080131963977, 1.09559948274]),
    parent: 'Saturn'
  },
  'Skathi': {
    orbit: new Float32Array([0.103611550802, 0.223880097974, 2.58053712246, 4.95814609142, 2.04485623836, 0.00871990384479, 3.53665481057]),
    parent: 'Saturn'
  },
  'Erriapus': {
    orbit: new Float32Array([0.115046284082, 0.617653923715, 0.599097016119, 2.5517757921, 5.35178790275, 0.00745272443216, 4.88554229276]),
    parent: 'Saturn'
  },
  'Siarnaq': {
    orbit: new Float32Array([0.117381819266, 0.390815897708, 0.846457423583, 1.1163782935, 3.328577984, 0.00723140529097, 1.19348257806]),
    parent: 'Saturn'
  },
  'Thrymr': {
    orbit: new Float32Array([0.135835994148, 0.505436786457, 3.0538070606, 4.31414748235, 6.12414630655, 0.00580900377392, 1.60571916794]),
    parent: 'Saturn'
  },
  'Narvi': {
    orbit: new Float32Array([0.130421008282, 0.269090593521, 2.42220851837, 3.12486980668, 1.90482939154, 0.00617451182791, 3.10987137217]),
    parent: 'Saturn'
  },
  'Methone': {
    orbit: new Float32Array([0.00130146125894, 0.00317137734944, 0.489642912719, 2.95816967844, 0.277029344983, 6.19408398684, 2.34837099258]),
    parent: 'Saturn'
  },
  'Pallene': {
    orbit: new Float32Array([0.00142186462187, 0.00597990307596, 0.489283149278, 2.95205227549, 0.0186725529349, 5.42421111529, 1.75271472544]),
    parent: 'Saturn'
  },
  'Polydeuces': {
    orbit: new Float32Array([0.00252279723859, 0.0190769360026, 0.492279699619, 2.96183198939, 1.24711395063, 2.29509378321, 5.95515556516]),
    parent: 'Saturn'
  },
  'Daphnis': {
    orbit: new Float32Array([0.000916920746477, 0.00484290585853, 0.48960382973, 2.95886410022, 0.00386731912379, 10.4743301345, 1.9787850818]),
    parent: 'Saturn'
  },
  'Aegir': {
    orbit: new Float32Array([0.139030729208, 0.286274064518, 2.92957154728, 3.17780942856, 0.458687989184, 0.00560993405431, 4.27649649948]),
    parent: 'Saturn'
  },
  'Bebhionn': {
    orbit: new Float32Array([0.114935977568, 0.377680700167, 0.756734528678, 3.45027234621, 2.86306984464, 0.00746345581429, 0.0861099470031]),
    parent: 'Saturn'
  },
  'Bergelmir': {
    orbit: new Float32Array([0.127086176105, 0.119474433966, 2.77924699125, 3.62664095057, 5.42754876322, 0.00641913468989, 2.34498418188]),
    parent: 'Saturn'
  },
  'Bestla': {
    orbit: new Float32Array([0.134812983245, 0.617991184747, 2.55290724391, 4.93827591719, 4.17496037468, 0.00587525036578, 1.49235680602]),
    parent: 'Saturn'
  },
  'Farbauti': {
    orbit: new Float32Array([0.13665907187, 0.244106077074, 2.73088221858, 2.41092746676, 4.97316649644, 0.00575660269574, 5.99497048656]),
    parent: 'Saturn'
  },
  'Fenrir': {
    orbit: new Float32Array([0.146356400285, 0.191239207708, 2.87289261866, 4.09672266531, 2.57760431867, 0.00519405301562, 2.00443619422]),
    parent: 'Saturn'
  },
  'Fornjot': {
    orbit: new Float32Array([0.167115449868, 0.267589077451, 2.93190957477, 4.70021789402, 4.05103912701, 0.00425695494236, 5.61991428797]),
    parent: 'Saturn'
  },
  'Hati': {
    orbit: new Float32Array([0.129645671789, 0.429264301525, 2.80135080939, 5.52086087973, 3.1994074272, 0.00622998388559, 0.180255649608]),
    parent: 'Saturn'
  },
  'Hyrrokkin': {
    orbit: new Float32Array([0.124053079815, 0.462076165584, 2.7018096327, 0.700404753837, 5.15095445674, 0.00665598954052, 4.62068896892]),
    parent: 'Saturn'
  },
  'Kari': {
    orbit: new Float32Array([0.149955772193, 0.469225777217, 2.55687561733, 5.03157706987, 5.22741036396, 0.00500817130651, 2.79614039132]),
    parent: 'Saturn'
  },
  'Loge': {
    orbit: new Float32Array([0.152241956383, 0.194202635223, 2.88421453012, 5.81168539357, 5.90246267793, 0.00489578596181, 0.355744331637]),
    parent: 'Saturn'
  },
  'Skoll': {
    orbit: new Float32Array([0.118144457499, 0.456414372682, 2.6746704055, 5.13214827767, 0.857302143476, 0.00716149888049, 3.25080020223]),
    parent: 'Saturn'
  },
  'Surtur': {
    orbit: new Float32Array([0.148257225944, 0.546617722082, 2.9306247754, 4.4541804115, 2.80957522668, 0.00509448341108, 5.48413984926]),
    parent: 'Saturn'
  },
  'Anthe': {
    orbit: new Float32Array([0.00132425447675, 0.00110456237561, 0.489498302291, 2.95815024007, 6.20314925843, 6.03485420259, 4.2019507817]),
    parent: 'Saturn'
  },
  'Jarnsaxa': {
    orbit: new Float32Array([0.127111576453, 0.282884503738, 2.84977450729, 0.160484882341, 3.39449648325, 0.00641721070958, 3.99744013097]),
    parent: 'Saturn'
  },
  'Greip': {
    orbit: new Float32Array([0.12267312716, 0.301643930746, 3.01039557703, 5.85957499573, 5.37364486236, 0.00676861485042, 2.54445767887]),
    parent: 'Saturn'
  },
  'Tarqeq': {
    orbit: new Float32Array([0.117945196, 0.103869714793, 0.879195205885, 1.62917119802, 2.0941305355, 0.00717965494272, 1.25003929764]),
    parent: 'Saturn'
  },
  'Aegaeon': {
    orbit: new Float32Array([0.00112319973274, 0.00328268245192, 0.489576643081, 2.9588146631, 0.0345174952356, 7.72571120675, 1.09710610936]),
    parent: 'Saturn'
  },
  'Ariel': {
    orbit: new Float32Array([0.00127636399574, 0.00152088816807, 1.7055587954, 2.92546462185, 2.70250138466, 2.49261013285, 0.755450462341]),
    parent: 'Uranus'
  },
  'Umbriel': {
    orbit: new Float32Array([0.00177818228636, 0.00416993413953, 1.70482585235, 2.92581890493, 4.74188617341, 1.51583459736, 5.83794502806]),
    parent: 'Uranus'
  },
  'Titania': {
    orbit: new Float32Array([0.00291644876596, 0.00251685301278, 1.70730214867, 2.9254025354, 1.26707137622, 0.721672279271, 3.55966541784]),
    parent: 'Uranus'
  },
  'Oberon': {
    orbit: new Float32Array([0.00390080371658, 0.000564004095674, 1.70829099369, 2.9278999153, 1.65217756467, 0.466540761551, 4.41301532706]),
    parent: 'Uranus'
  },
  'Miranda': {
    orbit: new Float32Array([0.000868139191996, 0.0015023403218, 1.69764660981, 3.00311764665, 1.06897539908, 4.44354070797, 4.5695644969]),
    parent: 'Uranus'
  },
  'Cordelia': {
    orbit: new Float32Array([0.000333048985879, 0.00158343798212, 1.70629019348, 2.92507378309, 6.16160305295, 18.7003989648, 4.03311465078]),
    parent: 'Uranus'
  },
  'Ophelia': {
    orbit: new Float32Array([0.000359913849559, 0.0110878460309, 1.70539723431, 2.92712836491, 0.57525083428, 16.6462038004, 4.4137574689]),
    parent: 'Uranus'
  },
  'Bianca': {
    orbit: new Float32Array([0.000395898445308, 0.00145050076964, 1.70391701876, 2.92330201276, 5.71300488177, 14.4290371331, 4.6087925831]),
    parent: 'Uranus'
  },
  'Cressida': {
    orbit: new Float32Array([0.000413265170068, 0.000645103007565, 1.70556104741, 2.92584908899, 0.220288360792, 13.5291290277, 5.01008489012]),
    parent: 'Uranus'
  },
  'Desdemona': {
    orbit: new Float32Array([0.000419202860005, 0.000901318484553, 1.70473837793, 2.92756239373, 6.22102003127, 13.2427045558, 4.80400792702]),
    parent: 'Uranus'
  },
  'Juliet': {
    orbit: new Float32Array([0.000430559688126, 0.000525905788916, 1.70598733996, 2.92558887067, 0.831294820967, 12.7222227934, 0.147176363017]),
    parent: 'Uranus'
  },
  'Portia': {
    orbit: new Float32Array([0.000442173512567, 0.000794629845315, 1.70652419043, 2.925211634, 0.110008219461, 12.2242988922, 5.63618659658]),
    parent: 'Uranus'
  },
  'Rosalind': {
    orbit: new Float32Array([0.000467765661716, 0.000887123123013, 1.70294564285, 2.92501873562, 0.212001934578, 11.2349343579, 0.421966495213]),
    parent: 'Uranus'
  },
  'Belinda': {
    orbit: new Float32Array([0.000503367860089, 0.00059310551028, 1.70610193492, 2.92566413313, 0.341917772069, 10.0643289176, 0.436196543858]),
    parent: 'Uranus'
  },
  'Puck': {
    orbit: new Float32Array([0.000575170361289, 0.000275606182456, 1.70026960153, 2.9228361798, 0.193821902269, 8.23983087126, 4.36169348621]),
    parent: 'Uranus'
  },
  'Caliban': {
    orbit: new Float32Array([0.047926372647, 0.0811076669754, 2.43989277276, 3.05585386633, 0.460215691084, 0.0108330614116, 5.9197292557]),
    parent: 'Uranus'
  },
  'Sycorax': {
    orbit: new Float32Array([0.0814053919653, 0.513592615985, 2.66358846407, 4.46068410189, 4.56566131221, 0.00489365431586, 0.300474767307]),
    parent: 'Uranus'
  },
  '1999U3': {
    orbit: new Float32Array([0.108856096265, 0.322473656783, 2.55334250662, 5.58685689221, 4.32000219575, 0.00316470994446, 2.9907533536]),
    parent: 'Uranus'
  },
  '1999U1': {
    orbit: new Float32Array([0.116605231925, 0.558500229828, 2.55649650045, 4.35926672833, 3.02083123907, 0.00285453905885, 0.0644186631575]),
    parent: 'Uranus'
  },
  '1999U2': {
    orbit: new Float32Array([0.0531834857945, 0.143872240322, 2.47183537531, 3.30685103718, 4.45931436851, 0.00926718530724, 0.501123964441]),
    parent: 'Uranus'
  },
  'Trinculo': {
    orbit: new Float32Array([0.0568127245608, 0.222940181142, 2.89973444023, 3.47220634767, 3.18905425133, 0.00839352947247, 2.82146338787]),
    parent: 'Uranus'
  },
  'Francisco': {
    orbit: new Float32Array([0.0285909037075, 0.137575645809, 2.57515341338, 1.79941937138, 0.384866888973, 0.0235110064819, 2.15326493193]),
    parent: 'Uranus'
  },
  'Margaret': {
    orbit: new Float32Array([0.0967218332519, 0.82758761721, 0.897375530366, 0.459103508042, 5.65301046048, 0.00377855950813, 1.28190871823]),
    parent: 'Uranus'
  },
  'Ferdinand': {
    orbit: new Float32Array([0.136437317011, 0.421034354262, 2.91810857692, 3.90145894782, 0.369689715554, 0.00225534658041, 2.91389201063]),
    parent: 'Uranus'
  },
  'Perdita': {
    orbit: new Float32Array([0.000511114979211, 0.0116010514665, 1.6984536646, 2.93011833271, 4.71356389938, 9.83637623861, 6.09598369882]),
    parent: 'Uranus'
  },
  'Mab': {
    orbit: new Float32Array([0.000653558992741, 0.00242188559397, 1.7039048036, 2.92433975274, 4.46080506052, 6.80277102631, 6.07955412296]),
    parent: 'Uranus'
  },
  'Cupid': {
    orbit: new Float32Array([0.000497591662677, 0.000884617510481, 1.7058835068, 2.92770194243, 2.15784744288, 10.2400812606, 3.25039930241]),
    parent: 'Uranus'
  },
  'Triton': {
    orbit: new Float32Array([0.002371460857, 2.45735904081e-05, 2.27338522517, 3.76719119969, 6.20394269181, 1.06910276636, 1.38173197009]),
    parent: 'Neptune'
  },
  'Nereid': {
    orbit: new Float32Array([0.0368399083832, 0.750663792349, 0.0883264296379, 5.57791847399, 3.76327996459, 0.0174590348872, 5.18353634663]),
    parent: 'Neptune'
  },
  'Naiad': {
    orbit: new Float32Array([0.000322823326389, 0.00167812318492, 0.57706486431, 0.893964247872, 0.0997135401575, 21.2838741707, 0.699828191365]),
    parent: 'Neptune'
  },
  'Thalassa': {
    orbit: new Float32Array([0.000335162206517, 0.00128837206763, 0.496661910799, 0.857439934788, 6.16116469168, 20.1194212455, 4.64616094689]),
    parent: 'Neptune'
  },
  'Despina': {
    orbit: new Float32Array([0.000351533932162, 0.00107894460578, 0.498603154252, 0.855031356085, 6.14359203851, 18.73040495, 1.8516934718]),
    parent: 'Neptune'
  },
  'Galatea': {
    orbit: new Float32Array([0.000414480076189, 0.000887581476081, 0.498606635362, 0.853148035565, 0.085522487578, 14.6299403822, 0.956764357409]),
    parent: 'Neptune'
  },
  'Larissa': {
    orbit: new Float32Array([0.000491926936527, 0.000834265729263, 0.499198866388, 0.845127171406, 2.73317314313, 11.3148067039, 3.16829371843]),
    parent: 'Neptune'
  },
  'Proteus': {
    orbit: new Float32Array([0.000786607224861, 0.000490350515346, 0.506510064877, 0.842245070541, 4.83672818025, 5.59578665855, 5.81674602155]),
    parent: 'Neptune'
  },
  'Halimede': {
    orbit: new Float32Array([0.110995518173, 0.259973768426, 1.9524021448, 3.79495463712, 4.01440485214, 0.00333841159818, 2.73751200386]),
    parent: 'Neptune'
  },
  'Psamathe': {
    orbit: new Float32Array([0.313291878873, 0.339875496568, 2.15504862567, 5.59104720873, 3.1897274308, 0.00070400272325, 2.24712262894]),
    parent: 'Neptune'
  },
  'Sao': {
    orbit: new Float32Array([0.14827871422, 0.140320979537, 0.924683574424, 1.08469486811, 0.244504764782, 0.00216212016805, 1.08381093188]),
    parent: 'Neptune'
  },
  'Laomedeia': {
    orbit: new Float32Array([0.157268141795, 0.373302700747, 0.657568808348, 0.924021965152, 2.69814516574, 0.00197941525019, 2.31871805808]),
    parent: 'Neptune'
  },
  'Neso': {
    orbit: new Float32Array([0.34498930662, 0.620917091847, 2.47541215511, 0.592948012853, 3.94186240188, 0.000609241662221, 1.16594326913]),
    parent: 'Neptune'
  },
  'ISS': {
    orbit: new Float32Array([4.51690895394e-05, 0.00114068857706, 0.928016868425, 4.48675738134, 4.75334547714, 98.2047521178, 1.38063839059]),
    parent: 'Earth',
    load: 'data/models/iss.fbx'
  },
  'Hubble': { // Note this orbit is incorrect and only used for testing
    orbit: new Float32Array([4.51690895394e-05, 0.00114068857706, 1.928016868425, 4.48675738134, 4.75334547714, 98.2047521178, 1.38063839059]),
    parent: 'Earth',
    load: 'data/models/hubble.fbx'
  }
};

// Length of each epoch for planetOrbitData (between groups of 7 data points)
var epochLength = 660;

var zeroVector = new THREE.Vector3(0, 0, 0);

function calculateBodyPosition(name, t, forceEpoch = null) {
  // Calculate position of "name" at Julian Date t

  // Find corresponding data

  if (name === 'Sirius') {
    return new THREE.Vector3(5e17,5e14,4e12);
  }

  if (moonOrbitData[name] !== undefined) {
    return calculateMoonPosition(name, t, forceEpoch);
  }

  var thisData = planetOrbitData[name];
  if (thisData === undefined) {
    thisData = minorOrbitData[name];
    if (thisData === undefined) return zeroVector;

    var adjT = t - 2451545;
    var anomaly = (thisData[4] + adjT * thisData[5]) % (2 * Math.PI);

    return calculateBodyPositionFromOrbit(thisData[0], thisData[1], thisData[2], thisData[3], anomaly, thisData[6]);
  }

  // Calculate epoch
  var epoch = null;

  if (forceEpoch != null) {
    epoch = forceEpoch;
  } else {
    epoch = Math.max(0, Math.round((t + 1930633.5) / epochLength));
  }

  if (epoch >= 11066) {
    epoch = 11065;
    var adjT = t + 1930633.5 - epoch * epochLength;
    epoch *= 7;

    // Get data from array
    var axis = thisData[epoch];
    var ecc = thisData[epoch + 1];
    var incl = thisData[epoch + 2];
    var ascn = thisData[epoch + 3];
    var anomaly = (thisData[epoch + 4] + adjT * thisData[epoch + 5]) % (2 * Math.PI);
    var peri = thisData[epoch + 6];

    // Calculate body position
    return calculateBodyPositionFromOrbit(axis, ecc, incl, ascn, anomaly, peri);
  }

  var adjT = t + 1930633.5 - epoch * epochLength;
  epoch *= 7;

  // Get data from array
  var axis = thisData[epoch] + adjT * (thisData[epoch + 7] - thisData[epoch]) / epochLength;
  var ecc = thisData[epoch + 1] + adjT * (thisData[epoch + 8] - thisData[epoch + 1]) / epochLength;
  var incl = thisData[epoch + 2] + adjT * (thisData[epoch + 9] - thisData[epoch + 2]) / epochLength;
  var ascn = thisData[epoch + 3] + adjT * (thisData[epoch + 10] - thisData[epoch + 3]) / epochLength;
  var anomaly = (thisData[epoch + 4] + adjT * thisData[epoch + 5]) % (2 * Math.PI);
  var peri = thisData[epoch + 6] + adjT * (thisData[epoch + 13] - thisData[epoch + 6]) / epochLength;

  // Calculate body position
  return calculateBodyPositionFromOrbit(axis, ecc, incl, ascn, anomaly, peri);
}

function calculateMoonPosition(name, t, forceEpoch = null) {
  var thisData = moonOrbitData[name].orbit;

  var adjT = t - 2451545;

  var anomaly = (thisData[4] + adjT * thisData[5]) % (2 * Math.PI);

  if (thisData[7]) {

    var ascn = (thisData[3] + adjT * thisData[8]) % (2 * Math.PI);
    var peri = (thisData[6] + adjT * thisData[7]) % (2 * Math.PI);
    return calculateBodyPositionFromOrbit(thisData[0],
      thisData[1], thisData[2], ascn, anomaly, peri).add(
      calculateBodyPosition(moonOrbitData[name].parent, t, forceEpoch));
  }
  return calculateBodyPositionFromOrbit(thisData[0],
    thisData[1], thisData[2], thisData[3], anomaly, thisData[6]).add(
    calculateBodyPosition(moonOrbitData[name].parent, t, forceEpoch));
}

function calculateBodyPositionFromOrbit(a, e, i, W, M, w) {
  // Calculates the position of a body given its orbbital parameters

  var E = M; // Eccentric anomaly

  // Newton's method: find root of M - E + e * sin(E)
  while (true) {
    var dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }

  // True anomaly
  var v = Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)) * 2;

  // Distance to center body
  var r = (a * (1 - e * e)) / (1 + e * Math.cos(v));

  // Rotate x, y, z coords relative to J2000 ecliptic
  var x = r * (Math.cos(W) * Math.cos(w + v) - Math.sin(W) * Math.sin(w + v) * Math.cos(i));
  var y = r * (Math.sin(W) * Math.cos(w + v) + Math.cos(W) * Math.sin(w + v) * Math.cos(i));
  var z = r * (Math.sin(i) * Math.sin(w + v));

  return new THREE.Vector3(-x, z, y).multiplyScalar(unitMultiplier);
}

function getOrbitalPeriod(bodyIndex) {
  // Finds the period of a body's orbit
  if (planetOrbitData[objs[bodyIndex].name]) {
    return 1 / (planetOrbitData[objs[bodyIndex].name][5] / (2 * Math.PI));
  } else if (minorOrbitData[objs[bodyIndex].name]) {
    return 1 / (minorOrbitData[objs[bodyIndex].name][5] / (2 * Math.PI));
  } else if (moonOrbitData[objs[bodyIndex].name]) {
    return 1 / (moonOrbitData[objs[bodyIndex].name].orbit[5] / (2 * Math.PI));
  } else {
    return 1;
  }
}

var planetNames = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter'];
var requests = []; // XMLHTTPRequests (asynchronous)
var loadedBodyDatas = 0;
var knownBodyNames = planetNames.slice(); // List of body names

var nonAsteroidNames = planetNames.slice();

var texturedMoons = ["Callisto", "Dione", "Europa", "Ganymede", "Iapetus", "Io", "Moon", "Rhea", "Tethys", "Titania", "Titan", "Triton"];

nonAsteroidNames.push('Saturn');
nonAsteroidNames.push('Uranus');
nonAsteroidNames.push('Neptune');

for (var body in moonOrbitData) {
  if (moonOrbitData.hasOwnProperty(body)) {
    nonAsteroidNames.push(body);
  }
}

for (var body in minorOrbitData) {
  if (minorOrbitData.hasOwnProperty(body)) {
    knownBodyNames.push(body);
  }
}

for (i = 0; i < planetNames.length; i++) {
  // Send HTTP requests for planets

  requests[i] = new XMLHttpRequest();
  requests[i].open("GET", "data/planets/" + planetNames[i].toLowerCase() + "330float32.bin", true);
  requests[i].responseType = "arraybuffer";

  requests[i].udder = i;

  requests[i].onload = function(self, oEvent) {
    // Process returned request
    var arrayBuffer = requests[self.target.udder || self.srcElement.udder].response;
    if (arrayBuffer) {
      planetOrbitData[planetNames[self.target.udder || self.srcElement.udder]] = new Float32Array(arrayBuffer);
      loadedBodyDatas += 1;

      drawOrbits();
    }
  };

  requests[i].send(null);
}
