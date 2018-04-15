//body
color([1,0.875,0.75])
difference() {
	resize([110,105,100]) sphere(10);
	translate([-55,-55,-110]) cube(110);
}
color([1,0.875,0.75])
difference() {
	resize([110,105,75]) sphere(10);
	translate([-55,-55,110]) cube(110);
}

//bottom
color([1,0.875,0.75]) {
    translate([-25,25,-45]) huv();
    translate([-25,-25,-45]) huv();
    translate([25,25,-45]) huv();
    translate([25,-25,-45]) huv();
}
color([1,0.75,0.75])
translate([0,0,-35]) uder();

//head
rotate ([5,0,5]) {
    color([1,0.875,0.75])
	difference() {
		translate([50,0,50]) resize([80,85,80]) sphere(r=10);
		translate([80,20,60]) rotate([-30,75,0]) ii();
		translate([80,-20,60]) rotate([30,75,0]) ii();
	}
    color([0.25,0.25,0.25])
	translate([75,15,55]) rotate([-30,75,0]) pipul();
    color([0.25,0.25,0.25])
	translate([75,-15,55]) rotate([30,75,0]) pipul();
    color([1,0.75,0.75])
	translate([85,0,35]) rotate([0,-65,0]) sat();

	//other
    color([0.25,0.25,0.25]) {
        translate([60,-25,80]) rotate([40,15,0]) hor();
        translate([60,25,80]) rotate([-40,15,0]) hor();
    }
    color([1,0.875,0.75]) {
        translate([60,-40,70]) rotate([0,-60,30]) ir();
        translate([60,40,70]) rotate([0,-60,-30]) ir();
    }
}

translate([-55,0,0]) rotate([0,-5,0]) tal();

module huv() {
	hull() {
		resize([30,30,20]) sphere(10);
		translate([0,0,10]) resize([20,20,20]) sphere(10);
	}
}

module uder() {
	resize([35,35,20]) sphere(10);
	translate([-5,5,-5]) rotate([-20,180,45]) nob();
	translate([-5,-5,-5]) rotate([20,180,-45]) nob();
	translate([5,5,-5]) rotate([-20,180,-45]) nob();
	translate([5,-5,-5]) rotate([20,180,45]) nob();
}

module nob() {
	hull() {
		resize([10,10,5]) sphere(10);
		translate([0,0,5]) resize([5,5,5]) sphere(10);
	}
}

module ii() {
	hull() {
		resize([20,20,5]) cylinder(10,r=10);
		resize([25,25,5]) sphere(10);
	}
}

module pipul() {
	hull() {
		resize([15,15,5]) cylinder(10,r=10);
		translate([0,0,5]) resize([15,15,5]) sphere(10);
	}
}

module sat() {
	difference() {
		hull() {
			resize([25,35,5]) cylinder(10,r=10);
			resize([30,40,5]) sphere(10);
		}
		translate([0,10,-5]) rotate([0,0,-30]) nosol();
		translate([0,-10,-5]) rotate([0,0,30]) nosol();
	}
}

module nosol() {
	hull() {
		resize([5,5,20]) cylinder(10,r=10);
		resize([5,10,5]) sphere(10);
	}
}

module hor() {
	hull() {
		resize([10,10,5]) sphere(10);
		translate([0,0,10]) resize([5,5,5]) sphere(10);
	}
}

module ir() {
	difference() {
		resize([15,20,10]) sphere(10);
		resize([10,15,5]) sphere(10);
		translate([-55,-55,-110]) cube(110);
	}
}

module tal() {
    color([1,0.875,0.75]) {
        resize([5,5,10]) sphere(10);
        translate([0,0,-25]) resize([5,5,25]) cylinder(10,r=10);
        translate([0,0,-25]) resize([5,5,10]) sphere(10);
    }
    color([0.25,0.25,0.25]) 
    translate([0,0,-25]) rotate([180,0,0]) hor();
}