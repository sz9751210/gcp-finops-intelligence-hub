from google.cloud import resourcemanager_v3
from typing import List, Dict

class GCPProjectRepository:
    def __init__(self):
        try:
            self.client = resourcemanager_v3.ProjectsClient()
        except Exception as e:
            print(f"Warning: Could not initialize ProjectsClient. Service account might be missing permissions. Error: {e}")
            self.client = None

    def list_accessible_projects(self) -> List[Dict[str, str]]:
        """
        Lists projects accessible to the service account.
        Returns a list of dicts with 'project_id' and 'display_name'.
        """
        if not self.client:
            return []

        try:
            # List projects
            request = resourcemanager_v3.ListProjectsRequest()
            page_result = self.client.list_projects(request=request)

            projects = []
            for project in page_result:
                if project.state == resourcemanager_v3.Project.State.ACTIVE:
                    projects.append({
                        "project_id": project.project_id,
                        "display_name": project.display_name,
                        "create_time": project.create_time.strftime("%Y-%m-%d"),
                        "parent": project.parent
                    })
            return projects
        except Exception as e:
            print(f"Error listing projects: {e}")
            # Fallback to single project from env if listing fails/forbidden
            return []
