!INC Local Scripts.EAConstants-JScript

/*
 * Script Name : EA_AutoXMIExport.js
 * Author      : Fujitsu
 * Purpose     : Export XMI Files for each nested package
 * Date        : 16 October 2015
 */

// Output Directory (Windows - YOLO)
var outputDirectory = "D:\\EA_Output\\";

// XMI Type
var xmiType21 = 11;

// Output log file
var logFile; 

function main()
{
    var logfilename = outputDirectory + "XMIDump.log";

    var ForWriting = 2;

    Repository.EnsureOutputVisible( "Script" );
    Repository.ClearOutput( "Script" );
    Session.Output("Starting XMI export...please wait...");

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    logFile = fso.OpenTextFile(logfilename, ForWriting, true);
	
	var modelEnumerator = new Enumerator(Repository.Models);
	while ( !modelEnumerator.atEnd() )
	{
		var currentModel as EA.Package;
		currentModel = modelEnumerator.item();
		
		// Export package to XMI
		dumpPackageToXMI(currentModel);
		
		// Recursively process this package
        recursePackage(currentModel);
    		
		modelEnumerator.moveNext();
	}

	Session.Output( "Export Completed. XMI Files saved at " + outputDirectory);
	logFile.Close();
}

function recursePackage(currentPackage)
{
	// Get child packages
    for (var j = 0 ; j < currentPackage.Packages.Count; j++)
    {
        var childPackage as EA.Package;
        childPackage = currentPackage.Packages.GetAt(j);
		
		// Export package to XMI
        dumpPackageToXMI(childPackage);
		// And recurse again
        recursePackage(childPackage);
    }
}

function getParentPath(childPackage)
{
    if (childPackage.ParentID != 0)
    {
        var parentPackage as EA.Package;
        parentPackage =  Repository.GetPackageByID(childPackage.ParentID);
        return getParentPath(parentPackage) + "/" + parentPackage.Name;
    }
    return "";
}

function dumpPackageToXMI(thePackage)
{
	// XMI output file
	var fileName = outputDirectory + thePackage.Name + ".xmi"
	
	// Perform the XMI export: 
	//  - Use XMI 2.1
	//  - 1 (Export Diagrams only, no images)
	//  - -1 (No Diagram Image Format)
	//  - true (Format XML Output)
	//  - false (Don't use a DTD)
	//  - filename (the output XMI filename)
	Repository.GetProjectInterface().ExportPackageXMI(thePackage.PackageGUID, xmiType21, 1, -1, true, false, fileName);
	
	// Output info to logfile
    logFile.WriteLine("Writing XMI files for GUID=" + thePackage.PackageGUID + ";"
                   + "NAME=" + thePackage.Name + ";" 
                   + "PARENT=" + getParentPath(thePackage).substring(1) + ";"
    );
}


main();
