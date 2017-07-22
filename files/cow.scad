$fn=50;

//body
difference() {
	resize([110,105,100]) sphere(r=10);
	translate([-55,-55,-110]) cube(110);
}
difference() {
	resize([110,105,75]) sphere(r=10);
	translate([-55,-55,110]) cube(110);
}

//bottom
translate([-25,25,-50]) huv();
translate([-25,-25,-50]) huv();
translate([25,25,-50]) huv();
translate([25,-25,-50]) huv();
translate([0,0,-35]) uder();

//head
difference() {
	translate([50,0,50]) resize([80,85,75]) sphere(r=10);
	translate([80,20,60]) rotate([-25,70,0]) ii();
	translate([80,-20,60]) rotate([25,70,0]) ii();
}
translate([75,15,60]) rotate([-25,70,0]) pipul();
translate([75,-15,55]) rotate([25,70,0]) pipul();
translate([75,0,20]) rotate([0,-35,0]) sat();

//other
translate([60,-25,80]) rotate([40,15,0]) hor();
translate([60,25,80]) rotate([-40,15,0]) hor();
translate([60,-40,70]) rotate([0,-60,30]) ir();
translate([60,40,70]) rotate([0,-60,-30]) ir();

module huv() {
	hull() {
		resize([30,30,20]) sphere(r=10);
		translate([0,0,15]) resize([20,20,20]) sphere(r=10);
	}
}

module uder() {
	resize([45,45,25]) sphere(r=10);
	translate([-10,10,-10]) rotate([-30,180,45]) nob();
	translate([-10,-10,-10]) rotate([30,180,-45]) nob();
	translate([10,10,-10]) rotate([-30,180,-45]) nob();
	translate([10,-10,-10]) rotate([30,180,45]) nob();
}

module nob() {
	hull() {
		resize([10,10,5]) sphere(r=10);
		translate([0,0,5]) resize([5,5,5]) sphere(r=10);
	}
}

module ii() {
	hull() {
		resize([20,20,5]) cylinder(r=10,h=10);
		resize([25,25,5]) sphere(r=10);
	}
}

module pipul() {
	hull() {
		resize([10,10,5]) cylinder(r=10,h=10);
		translate([0,0,5]) resize([10,10,5]) sphere(r=10);
	}
}

module sat() {
	difference() {
		hull() {
			resize([20,25,5]) cylinder(r=10,h=10);
			resize([25,30,5]) sphere(r=10);
		}
		translate([0,5,-5]) resize([5,5,20]) cylinder(r=10,h=10);
		translate([0,-5,-5]) resize([5,5,20]) cylinder(r=10,h=10);
	}
}

module hor() {
	hull() {
		resize([10,10,5]) sphere(r=10);
		translate([0,0,10]) resize([5,5,5]) sphere(r=10);
	}
}

module ir() {
	difference() {
		resize([15,20,10]) sphere(r=10);
		resize([10,15,5]) sphere(r=10);
		translate([-55,-55,-110]) cube(110);
	}
}