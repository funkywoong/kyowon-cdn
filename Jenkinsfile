podTemplate(label: 'docker-build',
	containers: [
		//Pull container for clone and build process
		containerTemplate(name: "docker", image: "docker", ttyEnabled: true, command: "cat"),
        containerTemplate(name: "argo", image: "argoproj/argo-cd-ci-builder:latest", ttyEnabled: true, command: "cat")
	],
    volumes: [
        hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
    ]
) {
    node('docker-build') {

        stage('Clone repository') {
            container('argo') {
                checkout scm
            }
        }

        stage('Build image') {
            container('docker') {
                script {
                    app = docker.build(
                        "'cf-signed-url'",
                        "--network host ."
                    )
                }
            }
        }

        stage('Push image') {
            container('docker') {
                script {
                    docker.withRegistry(
                        'https://451741833328.dkr.ecr.ap-northeast-2.amazonaws.com/cf-signed-url', 
                        'ecr:ap-northeast-2:jenkins-ecr-user') {
                        app.push("${env.BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
        }

        stage('Deploy k8s') {
            container('argo') {
                checkout([$class: 'GitSCM',
                        branches: [[name: '*/main' ]],
                        extensions: scm.extensions,
                        userRemoteConfigs: [[
                            url: 'git@github.com:funkywoong/sample-dev.git',
                            credentialsId: 'jenkins-ssh-private',
                        ]]
                ])
                sshagent(credentials: ['jenkins-ssh-private']) {
                    sh("""
                        #!/usr/bin/env bash
                        set +x
                        export GIT_SSH_COMMAND="ssh -oStrictHostKeyChecking=no"
                        git config --global user.email "duswldnd12@naver.com"
                        git checkout main
                        cat << EOF >> sample.txt
                        hi
                        EOF
                        git commit -a -m "chore:Test pipeline"
                        git push
                    """)
                }
            }
        }
    }
}